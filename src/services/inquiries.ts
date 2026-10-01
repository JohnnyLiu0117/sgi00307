import { receiptDrafts } from '@/services/studio-workflow';
import { createHash } from 'node:crypto';
import { db } from '@/db/client';
import { inquirySchema, cleanSourceUrl } from '@/domain/inquiry';
export async function submitInquiry(raw:unknown,rateKey:string){
  const v=inquirySchema.parse(raw);
  if(v.website)throw new Error('INVALID_SUBMISSION');
  const startsAt=new Date(`${v.date}T${v.time}:00+08:00`);
  if(startsAt.getTime()<Date.now())throw new Error('PAST_DATE');
  const hash=createHash('sha256').update(JSON.stringify(v)).digest('hex');
  const existing=await db.inquiry.findUnique({where:{idempotencyKey:v.idempotencyKey}});
  if(existing){if(existing.payloadHash!==hash)throw new Error('KEY_CONFLICT');return existing.receipt;}
  if(v.topicId&&!await db.topic.findFirst({where:{id:v.topicId,published:true},select:{id:true}}))throw new Error('INVALID_TOPIC');
  const sourceUrl=cleanSourceUrl(v.sourceUrl);
  const article=sourceUrl?await db.article.findUnique({where:{url:sourceUrl},select:{id:true}}):null;
  try{return await db.$transaction(async tx=>{
    const rate=await tx.rateLimit.upsert({where:{key:rateKey},create:{key:rateKey,expiresAt:new Date(Date.now()+600000)},update:{count:{increment:1}}});
    if(rate.count>5)throw new Error('RATE_LIMIT');
    const result=await tx.inquiry.create({data:{idempotencyKey:v.idempotencyKey,payloadHash:hash,organization:v.organization,contactName:v.contactName,email:v.email,phone:v.phone,venue:v.venue,region:v.region,startsAt,durationMinutes:v.durationMinutes,attendees:v.attendees,topicId:v.topicId||null,customTopic:v.customTopic||null,requirements:{create:{audiences:v.audiences,ageRange:v.ageRange,problems:v.problems,takeaways:v.takeaways,interaction:v.interaction,workshop:v.workshop,worksheet:v.worksheet,customContent:v.customContent,equipment:v.equipment,notes:v.notes}},attribution:{create:{discovery:v.discovery,sourceUrl,articleId:article?.id}}}});
    await tx.activityLog.create({data:{actor:'public',action:'inquiry.created',entityId:result.id}});
    await receiptDrafts(tx,result);
    return result.receipt;
  });}catch(error){if((error as {code?:string}).code==='P2002'){const r=await db.inquiry.findUnique({where:{idempotencyKey:v.idempotencyKey}});if(r&&r.payloadHash===hash)return r.receipt;}throw error;}
}
