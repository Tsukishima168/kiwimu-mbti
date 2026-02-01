/**
 * 測試 Discord Interactions Endpoint
 * 
 * 這個腳本會模擬 Discord 的 PING 請求來測試你的 endpoint
 * 
 * 使用方式：
 * DISCORD_PUBLIC_KEY=你的PublicKey \
 * ENDPOINT_URL=https://kiwimu-mbti.vercel.app/api/discord/interaction \
 * npx tsx scripts/test-discord-endpoint.ts
 */

import nacl from 'tweetnacl';

function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) return new Uint8Array();
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

function signBody(body: string, timestamp: string, privateKey: string): string {
  const message = new TextEncoder().encode(timestamp + body);
  const key = hexToUint8Array(privateKey);
  const signature = nacl.sign.detached(message, key);
  return Buffer.from(signature).toString('hex');
}

async function main() {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  const endpointUrl = process.env.ENDPOINT_URL || 'http://localhost:3000/api/discord/interaction';

  if (!publicKey) {
    console.error('❌ 請設定 DISCORD_PUBLIC_KEY 環境變數');
    process.exit(1);
  }

  console.log('🧪 測試 Discord Interactions Endpoint');
  console.log(`📍 Endpoint: ${endpointUrl}`);
  console.log(`🔑 Public Key: ${publicKey.substring(0, 20)}...\n`);

  // 建立一個 PING 請求（type: 1）
  const pingBody = JSON.stringify({ type: 1 });
  const timestamp = Date.now().toString();

  // 注意：這裡我們無法真正簽名（因為我們沒有 private key）
  // 但我們可以測試 endpoint 是否能正確處理請求
  console.log('📤 發送 PING 請求...');
  console.log(`   Body: ${pingBody}`);
  console.log(`   Timestamp: ${timestamp}\n`);

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature-Ed25519': '0000000000000000000000000000000000000000000000000000000000000000', // 假簽名
        'X-Signature-Timestamp': timestamp,
      },
      body: pingBody,
    });

    console.log(`📥 回應狀態: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.log(`📥 回應內容: ${text}\n`);

    if (response.status === 401) {
      console.log('✅ Endpoint 正常運作（401 是預期的，因為我們用的是假簽名）');
      console.log('💡 這表示 endpoint 有正確驗簽，只是簽名不對');
      console.log('💡 請確認：');
      console.log('   1. DISCORD_PUBLIC_KEY 已正確設定到 Vercel');
      console.log('   2. Vercel 已重新部署最新版本');
      console.log('   3. 在 Discord Developer Portal 重新儲存 Interactions URL');
    } else if (response.status === 500) {
      console.log('❌ Server Error - 檢查 Vercel logs');
    } else {
      console.log(`⚠️  意外的狀態碼: ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ 請求失敗:', error.message);
    console.log('\n💡 可能的原因：');
    console.log('   1. Endpoint URL 不正確');
    console.log('   2. Vercel 尚未部署');
    console.log('   3. 網路連線問題');
  }
}

main().catch(console.error);
