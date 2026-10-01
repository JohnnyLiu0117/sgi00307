import { db } from '@/db/client';
import { syncEvent } from '@/integrations/google/calendar';
import { randomUUID } from 'node:crypto';
export async function runJobs() {
  const owner = randomUUID();
  await db.jobLease.upsert({where:{id:'calendar-dispatch'},create:{id:'calendar-dispatch',owner:'',expiresAt:new Date(0)},update:{}});
  const claimed = await db.jobLease.updateMany({where:{id:'calendar-dispatch',expiresAt:{lt:new Date()}},data:{owner,expiresAt:new Date(Date.now()+300000)}});
  if(!claimed.count)return {done:0,failed:0};
  try { return await processJobs(); }
  finally { await db.jobLease.updateMany({where:{id:'calendar-dispatch',owner},data:{expiresAt:new Date(0)}}); }
}
async function processJobs(){const now=new Date();const jobs=await db.outboxJob.findMany({where:{OR:[{status:{in:['pending','retry']},nextAttemptAt:{lte:now}},{status:'running',leaseUntil:{lt:now}}]},orderBy:{createdAt:'asc'},take:3});let done=0,failed=0;for(const job of jobs){const claimed=await db.outboxJob.updateMany({where:{id:job.id,OR:[{status:{in:['pending','retry']}},{status:'running',leaseUntil:{lt:now}}]},data:{status:'running',leaseUntil:new Date(Date.now()+120000),attempts:{increment:1}}});if(!claimed.count)continue;try{await syncEvent(job.eventId);await db.outboxJob.update({where:{id:job.id},data:{status:'done',leaseUntil:null,error:null}});done++;}catch(e){const error=(e as Error).message;const retry=job.attempts<4&&!/CONNECTED|REQUIRED/.test(error);await db.outboxJob.update({where:{id:job.id},data:{status:retry?'retry':'needs_attention',leaseUntil:null,nextAttemptAt:new Date(Date.now()+Math.min(3600000,30000*2**job.attempts)),error:/^GOOGLE_[A-Z_0-9]+$/.test(error)?error:'SYNC_FAILED'}});failed++;}}await db.rateLimit.deleteMany({where:{expiresAt:{lt:new Date()}}});return {done,failed};}
