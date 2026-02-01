import nacl from 'tweetnacl';

function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) return new Uint8Array();
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

export function verifyDiscordSignature(params: {
  publicKey: string;
  signature: string;
  timestamp: string;
  rawBody: string;
}): boolean {
  const { publicKey, signature, timestamp, rawBody } = params;
  if (!publicKey || !signature || !timestamp) return false;

  const body = new TextEncoder().encode(timestamp + rawBody);
  const sig = hexToUint8Array(signature);
  const key = hexToUint8Array(publicKey);

  return nacl.sign.detached.verify(body, sig, key);
}

