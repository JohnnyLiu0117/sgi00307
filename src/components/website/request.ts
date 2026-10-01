export async function websiteFetch(input: RequestInfo | URL, init?: RequestInit) {
  let response: Response;
  const file = init?.body instanceof FormData ? init.body.get('file') : null;
  if (file instanceof File && file.size > 4 * 1024 * 1024) {
    const error = '工作室單檔上限 4MB。請壓縮檔案，或從備援網站後台上傳。';
    window.dispatchEvent(new CustomEvent('website-error',{detail:error}));
    return Response.json({error},{status:413});
  }
  try { response = await fetch(input, init); }
  catch { response = Response.json({error:'連線中斷，請重新整理後再試。'}, {status:502}); }
  if (!response.ok) {
    const result = await response.clone().json().catch(()=>({}));
    window.dispatchEvent(new CustomEvent('website-error',{detail:result.error || '操作未完成，請稍後再試。'}));
  }
  return response;
}
