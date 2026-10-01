import { createHash, randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { db } from '@/db/client';
import { seal, unseal, accessToken } from '@/integrations/google/calendar';
import { displayDate } from '@/domain/inquiry';

export const origin = () => process.env.NEXTAUTH_URL!;
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function findPortal(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return db.organizerPortal.findFirst({where:{tokenHash:tokenHash(token),revoked:false,expiresAt:{gt:new Date()}},include:{inquiry:{include:{topic:true,event:true,quotes:{where:{status:{in:['issued','accepted']}},orderBy:{version:'desc'}}}},feedback:true}});
}
export async function receiptDrafts(tx: Prisma.TransactionClient, i: {id:string;receipt:string;contactName:string;email:string;organization:string;startsAt:Date}) {
  const drafts = [
    {dedupeKey:'receipt:'+i.id,recipient:i.email,subject:`演講邀約已收件｜${i.organization}`,body:`${i.contactName} 您好：\n\n已收到貴單位的演講邀約。\n收件編號：${i.receipt}\n預計時間：${displayDate(i.startsAt)}\n\n目前為需求洽談階段，尚未確認檔期。講師將於檢視需求後回覆，若有急迫時程，請回覆本信告知。\n\n強尼老師｜劉宗騰`},
    {dedupeKey:'notification:'+i.id,recipient:process.env.OWNER_EMAIL||'sgi00307@gmail.com',subject:`新演講邀約｜${i.organization}`,body:`收到 ${i.organization} 的新邀約。\n預計時間：${displayDate(i.startsAt)}\n\n登入工作室查看與回覆：\n${origin()}/admin/speaking/inquiries/${i.id}`}
  ];
  for (const d of drafts) await tx.mailDraft.upsert({where:{dedupeKey:d.dedupeKey},create:{...d,inquiryId:i.id},update:{}});
}
export async function createPortal(inquiryId:string) {
  const token=randomBytes(32).toString('base64url');
  return db.organizerPortal.upsert({where:{inquiryId},create:{inquiryId,tokenHash:tokenHash(token),tokenEncrypted:seal(token),expiresAt:new Date(Date.now()+90*86400000)},update:{tokenHash:tokenHash(token),tokenEncrypted:seal(token),expiresAt:new Date(Date.now()+90*86400000),revoked:false}});
}
export const portalLink=(p:{tokenEncrypted:string})=>origin()+'/organizer/'+unseal(p.tokenEncrypted);
export async function sendDraft(id:string) {
  const connection=await db.googleConnection.findUnique({where:{id:'owner'}});
  if(!connection?.scopes.split(' ').includes('https://www.googleapis.com/auth/gmail.send')) throw new Error('請先在帳號與串接完成 Gmail 寄信授權');
  const token=await accessToken();
  const claimed=await db.mailDraft.updateMany({where:{id,status:'draft'},data:{status:'sending',error:null}});
  if(!claimed.count)throw new Error('此信件已處理，請重新載入');
  const d=await db.mailDraft.findUniqueOrThrow({where:{id}});
  let submitted=false;
  try {
    if(/[\r\n]/.test(d.recipient)||!d.recipient.includes('@'))throw new Error('收件地址無效');
    const mime=[`From: ${process.env.OWNER_EMAIL||'sgi00307@gmail.com'}`,`To: ${d.recipient}`,`Subject: =?UTF-8?B?${Buffer.from(d.subject).toString('base64')}?=`,`Message-ID: <${d.id}@johnny-edu-speaking-hub.vercel.app>`,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',Buffer.from(d.body).toString('base64').match(/.{1,76}/g)?.join('\r\n')||''].join('\r\n');
    submitted=true;
    const r=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({raw:Buffer.from(mime).toString('base64url')}),signal:AbortSignal.timeout(20000)});
    if(!r.ok){submitted=r.status>=500;throw new Error('Gmail 未完成寄送，請檢查授權或寄送配額');}
    const result=await r.json();
    await db.mailDraft.update({where:{id},data:{status:'sent',providerId:result.id,sentAt:new Date()}});
  } catch {
    await db.mailDraft.update({where:{id},data:{status:submitted?'uncertain':'draft',error:submitted?'結果待確認，請先檢查 Gmail 寄件備份，避免重複寄送。':'寄送未完成，請檢查 Gmail 授權與 API 設定。'}});
    throw new Error('寄送未確認，請查看信件狀態');
  }
}