import { createHmac } from 'node:crypto';
import { ZodError } from 'zod';
import { submitInquiry } from '@/services/inquiries';
export async function POST(req:Request){
  const reqOrigin=req.headers.get('origin');
  if(reqOrigin&&reqOrigin!==new URL(req.url).origin)return Response.json({error:'請從本站表單提交邀約'},{status:403});
  if(!process.env.DATABASE_URL)return Response.json({error:'收件服務暫時無法使用，請使用既有 Google 表單。'},{status:503});
  if(process.env.NODE_ENV==='production'&&!process.env.RATE_LIMIT_SECRET)return Response.json({error:'收件服務尚未就緒'},{status:503});
  try{
    const text=await req.text();if(Buffer.byteLength(text)>20000)return Response.json({error:'表單內容過長'},{status:413});
    // Vercel sets this header at its trusted edge. Local requests share a conservative bucket.
    const address=process.env.VERCEL?req.headers.get('x-vercel-forwarded-for')?.split(',')[0]||'unknown':'local';
    const bucket=Math.floor(Date.now()/600000);
    const rateKey=createHmac('sha256',process.env.RATE_LIMIT_SECRET||'local-development').update(`${address}:${bucket}`).digest('hex');
    const receipt=await submitInquiry(JSON.parse(text),rateKey);
    return Response.json({receipt,message:'已收到邀約，活動仍需由講師確認。'},{status:201,headers:{'Cache-Control':'no-store'}});
  }catch(error){
    if(error instanceof ZodError)return Response.json({error:'請檢查表單內容',fields:error.flatten().fieldErrors},{status:400});
    const message=(error as Error).message;
    const messages:Record<string,string>={RATE_LIMIT:'提交次數較多，請稍後再試或使用 Google 表單。',PAST_DATE:'活動日期需在未來，請重新選擇。',KEY_CONFLICT:'這次提交內容已變更，請重新整理後再次送出。',INVALID_TOPIC:'此主題暫不接受邀約，請重新選擇。',INVALID_SUBMISSION:'無法送出，請重新填寫。'};
    if(messages[message])return Response.json({error:messages[message]},{status:message==='RATE_LIMIT'?429:400});
    if(error instanceof SyntaxError)return Response.json({error:'表單格式不正確'},{status:400});
    console.error('inquiry.submit.failed', {code:(error as {code?:string}).code||'unknown'});
    return Response.json({error:'收件服務暫時無法使用，資料尚未確認送達。請稍後再試或使用 Google 表單。'},{status:503});
  }
}