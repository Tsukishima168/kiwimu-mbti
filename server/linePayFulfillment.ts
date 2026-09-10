import {
  buildLinePayApiPath,
  isLinePaySuccessCode,
  parseMbtiTypeFromOrderId,
  requestLinePay,
  V2_REPORT_CURRENCY,
  V2_REPORT_PRICE_TWD,
} from './linePay.js';
import {
  getLinePayOrder,
  updateLinePayOrder,
} from './linePayOrderStore.js';
import { getUserAdminDb } from './supabase/user-admin.js';

export type LinePayFulfillmentOutcome =
  | {
      ok: true;
      orderId: string;
      mbtiType: string;
      source: string;
    }
  | {
      ok: false;
      orderId: string;
      mbtiType?: string;
      reason: string;
    };

export async function persistV2UnlockForUser(userUid?: string | null) {
  if (!userUid) return;

  try {
    const adminDb = getUserAdminDb();
    if (!adminDb) return;

    const unlockedAt = new Date().toISOString();
    const { error } = await adminDb
      .schema('public')
      .from('profiles')
      .update({
        v2_unlocked_at: unlockedAt,
        updated_at: unlockedAt,
      })
      .eq('id', userUid);

    if (error) {
      console.error('[LINE PAY] failed to persist v2_unlocked_at', error);
    }
  } catch (dbError) {
    console.error('[LINE PAY] Supabase update error', dbError);
  }
}

export async function fulfillLinePayOrder({
  orderId,
  transactionId,
  typeFromQuery = '',
  sourceFromQuery = '',
}: {
  orderId: string;
  transactionId: string;
  typeFromQuery?: string;
  sourceFromQuery?: string;
}): Promise<LinePayFulfillmentOutcome> {
  try {
    const storedOrder = await getLinePayOrder(orderId);
    const mbtiType = storedOrder?.mbti_type || parseMbtiTypeFromOrderId(orderId) || typeFromQuery;
    const source = storedOrder?.source || sourceFromQuery || 'linepay';
    const userUid = storedOrder?.user_uid || '';

    if (!mbtiType) {
      return { ok: false, orderId, reason: 'missing_mbti_type' };
    }

    if (storedOrder === undefined) {
      console.error('[LINE PAY] confirm blocked: order store unavailable', { orderId, transactionId });
      return { ok: false, orderId, mbtiType, reason: 'store_unavailable' };
    }

    if (storedOrder === null) {
      console.error('[LINE PAY] confirm blocked: order not found', { orderId, transactionId });
      return { ok: false, orderId, mbtiType, reason: 'order_not_found' };
    }

    if (storedOrder.status === 'cancelled') {
      return { ok: false, orderId, mbtiType, reason: 'cancelled' };
    }

    if (storedOrder.status === 'confirmed') {
      return { ok: true, orderId, mbtiType, source };
    }

    if (
      storedOrder.line_transaction_id &&
      storedOrder.line_transaction_id !== transactionId
    ) {
      await updateLinePayOrder(orderId, {
        status: 'confirm_failed',
        last_error: `transaction_id_mismatch:${transactionId}`,
      }, { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] });
      console.error('[LINE PAY] confirm blocked: transaction mismatch', {
        orderId,
        expectedTransactionId: storedOrder.line_transaction_id,
        transactionId,
      });
      return { ok: false, orderId, mbtiType, reason: 'transaction_mismatch' };
    }

    const amount = storedOrder.amount ?? V2_REPORT_PRICE_TWD;
    const currency = storedOrder.currency ?? V2_REPORT_CURRENCY;
    const apiPath = buildLinePayApiPath(`/payments/${transactionId}/confirm`);
    const result = await requestLinePay({
      method: 'POST',
      apiPath,
      data: {
        amount,
        currency,
      },
    });

    if (!isLinePaySuccessCode(result.returnCode)) {
      await updateLinePayOrder(orderId, {
        status: 'confirm_failed',
        line_transaction_id: transactionId,
        line_return_code: result.returnCode,
        line_return_message: result.returnMessage,
        confirm_response: result as unknown as Record<string, unknown>,
        last_error: result.returnMessage || 'LINE Pay confirm failed',
      }, { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] });
      console.error('[LINE PAY] confirm failed', result);
      return { ok: false, orderId, mbtiType, reason: 'confirm_failed' };
    }

    const confirmedPersisted = await updateLinePayOrder(orderId, {
      status: 'confirmed',
      line_transaction_id: transactionId,
      line_return_code: result.returnCode,
      line_return_message: result.returnMessage,
      confirm_response: result as unknown as Record<string, unknown>,
      confirmed_at: new Date().toISOString(),
      last_error: null,
    }, {
      // A successful provider confirmation is the payment truth. It may win a
      // near-simultaneous browser cancel, while failure/cancel writes are never
      // allowed to overwrite an already confirmed order.
      expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed', 'cancelled'],
    });

    if (!confirmedPersisted) {
      const latestOrder = await getLinePayOrder(orderId);
      if (latestOrder?.status !== 'confirmed') {
        console.error('[LINE PAY] payment confirmed but order persistence failed', {
          orderId,
          transactionId,
        });
        return { ok: false, orderId, mbtiType, reason: 'confirmation_pending' };
      }
    }

    await persistV2UnlockForUser(userUid);

    return { ok: true, orderId, mbtiType, source };
  } catch (error) {
    console.error('[LINE PAY] confirm error', error);
    await updateLinePayOrder(orderId, {
      status: 'confirm_failed',
      line_transaction_id: transactionId || null,
      last_error: error instanceof Error ? error.message : 'LINE Pay confirm error',
    }, { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] });
    return {
      ok: false,
      orderId,
      mbtiType: parseMbtiTypeFromOrderId(orderId) || typeFromQuery || undefined,
      reason: 'confirm_exception',
    };
  }
}
