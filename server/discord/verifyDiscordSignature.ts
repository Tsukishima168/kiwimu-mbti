import nacl from 'tweetnacl';

function hexToUint8Array(hex: string): Uint8Array {
  const cleanHex = hex.trim().replace(/^0x/, '');
  const matches = cleanHex.match(/.{1,2}/g);
  if (!matches) return new Uint8Array();
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

export function verifyDiscordSignature(params: {
  publicKey: string;
  signature: string;
  timestamp: string;
  rawBody: string;
}): boolean {
  // 1. 強制去除空白與可能的 0x 前綴
  const publicKey = params.publicKey?.trim() || '';
  const signature = params.signature?.trim() || '';
  const timestamp = params.timestamp?.trim() || '';
  const { rawBody } = params;

  if (!publicKey || !signature || !timestamp) {
    console.warn('[SIGNATURE] ❌ Missing params', { hasKey: !!publicKey, hasSig: !!signature, hasTs: !!timestamp });
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const body = encoder.encode(timestamp + rawBody);
    const sig = hexToUint8Array(signature);
    const key = hexToUint8Array(publicKey);

    // Verify using tweetnacl
    const result = nacl.sign.detached.verify(body, sig, key);

    if (!result) {
      console.warn('[SIGNATURE] ❌ Verification failed logic check');
    }

    return result;
  } catch (err) {
    console.error('[SIGNATURE] ❌ Crypto error:', err);
    return false;
  }
}

