import { brand } from './brand';

export class WebsiteBridgeError extends Error {
  constructor(message: string, public readonly status = 502) { super(message); }
}

const methods: Record<string, readonly string[]> = {
  qa: ['GET'], 'qa/id': ['PATCH'], articles: ['GET', 'POST'], 'articles/id': ['PUT', 'DELETE'],
  content: ['GET', 'POST'], 'content/id': ['PUT', 'DELETE'], profile: ['GET', 'POST'],
  'profile-entries': ['GET', 'POST'], 'profile-entries/id': ['PUT', 'DELETE'],
  'media-library': ['GET', 'POST', 'PUT', 'DELETE'], upload: ['POST'], events: ['GET'],
};

export function allowedWebsiteRequest(path: string[], method: string) {
  if (path.length < 1 || path.length > 2) return false;
  if (path.length === 2 && !/^[1-9]\d*$/.test(path[1])) return false;
  return Boolean(methods[path[0] + (path.length === 2 ? '/id' : '')]?.includes(method));
}

export function isSameOriginMutation(request: Request) {
  const origin = request.headers.get('origin');
  const expected = new URL(process.env.NEXTAUTH_URL || request.url).origin;
  return origin === expected && request.headers.get('sec-fetch-site') !== 'cross-site';
}

export async function websiteRequest(path: string[], init: RequestInit = {}, query = '') {
  const method = init.method || 'GET';
  if (!allowedWebsiteRequest(path, method)) throw new WebsiteBridgeError('不支援的網站管理操作。', 400);
  const secret = (process.env.QA_BRIDGE_SECRET || process.env.SITES_QA_BRIDGE_SECRET)?.trim();
  if (!secret) throw new WebsiteBridgeError('網站串接尚未完成，請設定講師工作室的伺服器端連線參數。', 503);
  const origin = new URL(process.env.WEBSITE_BASE_URL || process.env.SITES_QA_API_BASE || brand.blog);
  if (origin.origin !== brand.blog || origin.username || origin.password)
    throw new WebsiteBridgeError('網站串接網址設定不正確。', 503);
  const prefix = path[0] === 'qa' ? '/api/integrations/speaking-hub/' : path[0] === 'events' ? '/api/' : '/api/studio/';
  const target = new URL(prefix + path.join('/'), origin);
  target.search = query;
  const headers = new Headers(init.headers);
  headers.set('authorization', 'Bearer ' + secret);
  let response: Response;
  try {
    response = await fetch(target, { ...init, method, headers, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(path[0] === 'qa' && method === 'PATCH' ? 90_000 : 30_000) });
  } catch {
    throw new WebsiteBridgeError('網站連線未完成，請稍後重新整理。');
  }
  if ([401, 403].includes(response.status)) throw new WebsiteBridgeError('網站串接驗證未通過，請確認兩端連線參數一致。', 503);
  if (!(response.headers.get('content-type') || '').includes('application/json'))
    throw new WebsiteBridgeError('網站目前未回傳管理資料，請檢查連線設定。');
  return response;
}
