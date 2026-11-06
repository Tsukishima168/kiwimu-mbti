// Vercel Functions 的 request／response 型別（本地宣告）。
//
// 這個 repo 的 api/ 與 server/ 只拿 `@vercel/node` 來借這兩個型別，執行期完全沒有用到它。
// 為了不再為了型別多裝一整棵 @vercel/* 依賴樹（含 @vercel/nft、@vercel/build-utils 等），
// 改成在這裡宣告。形狀與 `@vercel/node@5.10.2` 的 dist/index.d.ts 一致：
//   VercelRequest  = IncomingMessage & { query; cookies; body }
//   VercelResponse = ServerResponse  & { send; json; status; redirect }
// 只涵蓋程式實際用到的兩個型別；要新增成員時，請對照 Vercel 官方文件再補。
import type { IncomingMessage, ServerResponse } from 'node:http';

export type VercelRequest = IncomingMessage & {
  query: { [key: string]: string | string[] };
  cookies: { [key: string]: string };
  // Vercel 依 Content-Type 解析 body；形狀由各 handler 自行驗證。
  body: any;
};

export type VercelResponse = ServerResponse & {
  send: (body: any) => VercelResponse;
  json: (jsonBody: any) => VercelResponse;
  status: (statusCode: number) => VercelResponse;
  redirect: (statusOrUrl: string | number, url?: string) => VercelResponse;
};
