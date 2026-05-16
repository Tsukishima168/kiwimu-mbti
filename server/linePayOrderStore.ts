import { getUserAdminDb } from './supabase/user-admin';

const LINE_PAY_ORDERS_TABLE = 'line_pay_orders';

const linePayOrders = (db: any) => db.schema('public').from(LINE_PAY_ORDERS_TABLE);

export type LinePayOrderStatus =
  | 'created'
  | 'requested'
  | 'request_failed'
  | 'confirmed'
  | 'confirm_failed'
  | 'cancelled';

export type LinePayOrderRecord = {
  order_id: string;
  mbti_type: string;
  source: string;
  user_uid: string | null;
  status: LinePayOrderStatus;
  amount: number;
  currency: string;
  line_transaction_id: string | null;
  line_return_code: string | null;
  line_return_message: string | null;
  request_payload: Record<string, unknown> | null;
  request_response: Record<string, unknown> | null;
  confirm_response: Record<string, unknown> | null;
  cancel_context: Record<string, unknown> | null;
  last_error: string | null;
  requested_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LinePayOrderRecordInput = {
  order_id: string;
  mbti_type: string;
  source: string;
  user_uid: string | null;
  status: LinePayOrderStatus;
  amount: number;
  currency: string;
  line_transaction_id?: string | null;
  line_return_code?: string | null;
  line_return_message?: string | null;
  request_payload?: Record<string, unknown> | null;
  request_response?: Record<string, unknown> | null;
  confirm_response?: Record<string, unknown> | null;
  cancel_context?: Record<string, unknown> | null;
  last_error?: string | null;
  requested_at?: string | null;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
};

type CreateLinePayOrderInput = {
  orderId: string;
  mbtiType: string;
  source: string;
  userUid?: string | null;
  amount: number;
  currency: string;
  requestPayload?: Record<string, unknown> | null;
};

type UpdateLinePayOrderInput = Partial<
  Omit<
    LinePayOrderRecord,
    'order_id' | 'mbti_type' | 'source' | 'user_uid' | 'amount' | 'currency' | 'created_at'
  >
>;

export function isLinePayOrderStoreAvailable() {
  return Boolean(getUserAdminDb());
}

export async function createLinePayOrder(input: CreateLinePayOrderInput): Promise<boolean> {
  const db = getUserAdminDb();
  if (!db) return false;

  const now = new Date().toISOString();
  const { error } = await linePayOrders(db).upsert(
    {
      order_id: input.orderId,
      mbti_type: input.mbtiType,
      source: input.source,
      user_uid: input.userUid ?? null,
      status: 'created',
      amount: input.amount,
      currency: input.currency,
      request_payload: input.requestPayload ?? null,
      updated_at: now,
    },
    { onConflict: 'order_id' },
  );

  if (error) {
    console.error('[LINE PAY] createLinePayOrder error', error);
    return false;
  }

  return true;
}

export async function upsertLinePayOrder(input: LinePayOrderRecordInput): Promise<boolean> {
  const db = getUserAdminDb();
  if (!db) return false;

  const { error } = await linePayOrders(db).upsert(
    {
      ...input,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'order_id' },
  );

  if (error) {
    console.error('[LINE PAY] upsertLinePayOrder error', error);
    return false;
  }

  return true;
}

export async function getLinePayOrder(
  orderId: string,
): Promise<LinePayOrderRecord | null | undefined> {
  const db = getUserAdminDb();
  if (!db) return undefined;

  const { data, error } = await db
    .schema('public')
    .from(LINE_PAY_ORDERS_TABLE)
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) {
    console.error('[LINE PAY] getLinePayOrder error', error);
    return undefined;
  }

  return (data as LinePayOrderRecord | null) ?? null;
}

export async function updateLinePayOrder(
  orderId: string,
  input: UpdateLinePayOrderInput,
): Promise<boolean> {
  const db = getUserAdminDb();
  if (!db) return false;

  const { error } = await db
    .schema('public')
    .from(LINE_PAY_ORDERS_TABLE)
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  if (error) {
    console.error('[LINE PAY] updateLinePayOrder error', error);
    return false;
  }

  return true;
}
