import { readOwner } from '@/lib/auth';
import { allowedWebsiteRequest, isSameOriginMutation, websiteRequest, WebsiteBridgeError } from '@/lib/website-bridge';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;
type Context = { params: Promise<{ path: string[] }> };
const privateHeaders = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

async function proxy(request: Request, context: Context) {
  if (!(await readOwner())) return Response.json({ error: '請使用講師本人帳號登入工作室。' }, { status: 401, headers: privateHeaders });
  const { path } = await context.params;
  const statusRequest = path.length === 1 && path[0] === 'status' && request.method === 'GET';
  if (!statusRequest && !allowedWebsiteRequest(path, request.method)) return Response.json({ error: '不支援的操作。' }, { status: 400, headers: privateHeaders });
  const mutation = !['GET', 'HEAD'].includes(request.method);
  if (mutation && !isSameOriginMutation(request)) return Response.json({ error: '請從工作室頁面提交操作。' }, { status: 403, headers: privateHeaders });
  try {
    const headers = new Headers();
    if (request.headers.has('content-type')) headers.set('content-type', request.headers.get('content-type')!);
    const body = mutation ? await request.arrayBuffer() : undefined;
    if (body && body.byteLength > 4.25 * 1024 * 1024) return Response.json({ error: '工作室單檔上限 4MB，請先壓縮檔案。' }, { status: 413, headers: privateHeaders });
    const upstream = await websiteRequest(statusRequest ? ['qa'] : path, { method: request.method, headers, body }, new URL(request.url).search);
    const payload = await upstream.json();
    if (statusRequest && upstream.ok) return Response.json({ connected: true, assistant: payload.assistant, pendingCount: Array.isArray(payload.items) ? payload.items.filter((row:{status:string})=>!['published','archived'].includes(row.status)).length : null }, { headers: privateHeaders });
    if (path[0] === 'upload' && upstream.ok && typeof payload.url === 'string')
      payload.url = new URL(payload.url, 'https://john-liu-edu.sgi00307.chatgpt.site').href;
    return Response.json(payload, { status: upstream.status, headers: privateHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof WebsiteBridgeError ? error.message : '操作未完成，請重新載入後再試。' }, { status: error instanceof WebsiteBridgeError ? error.status : 502, headers: privateHeaders });
  }
}
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
