import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {PrismaClient} from '@prisma/client';

const base='https://johnny-edu-speaking-hub.vercel.app';
const key=randomUUID();
const db=new PrismaClient();
const input={organization:'[上線驗證] 自動清除',contactName:'系統驗證',email:'release-test@example.invalid',phone:'0000000000',venue:'上線驗證（非真實活動）',region:'線上',date:new Date(Date.now()+30*86400000).toISOString().slice(0,10),time:'14:00',durationMinutes:90,attendees:30,topicId:'ai-workflow',audiences:['教師'],problems:'驗證正式收件資料是否持久保存',takeaways:'確認重送不重複建案',interaction:false,workshop:false,worksheet:false,customContent:false,equipment:'無（測試）',discovery:'其他',consent:true,idempotencyKey:key};
const request=()=>fetch(base+'/api/public/v1/inquiries',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify(input),signal:AbortSignal.timeout(30000)});
try {
  const health=await fetch(base+'/api/health');assert.equal(health.status,200);assert.equal((await health.json()).status,'ok');console.log('PASS: production database health');
  const topics=await fetch(base+'/api/public/v1/topics');assert.equal(topics.status,200);const data=await topics.json();assert.ok(JSON.stringify(data).includes('ai-workflow'));console.log('PASS: published topics');
  const gate=await fetch(base+'/admin/speaking',{redirect:'manual'});assert.ok([302,303,307,308].includes(gate.status));assert.ok(gate.headers.get('location')?.includes('/login'));console.log('PASS: unauthenticated admin denied');
  const jobs=await fetch(base+'/api/internal/jobs/dispatch',{method:'POST'});assert.equal(jobs.status,401);console.log('PASS: unauthorized background job denied');
  const first=await request();assert.equal(first.status,201);const firstBody=await first.json();assert.ok(firstBody.receipt);assert.deepEqual(Object.keys(firstBody).sort(),['message','receipt']);
  const second=await request();assert.equal(second.status,201);assert.equal((await second.json()).receipt,firstBody.receipt);
  const saved=await db.inquiry.findMany({where:{idempotencyKey:key},include:{requirements:true,attribution:true,event:true}});
  assert.equal(saved.length,1);assert.equal(saved[0].organization,input.organization);assert.ok(saved[0].requirements);assert.ok(saved[0].attribution);assert.equal(saved[0].event,null);console.log('PASS: real submission saved once; requirements and attribution retained; no event reserved');
  const available=await fetch(base+'/api/public/v1/availability');assert.equal(available.status,200);const availability=JSON.stringify(await available.json());assert.equal(availability.includes(input.email),false);assert.equal(availability.includes(input.organization),false);console.log('PASS: public calendar contains no test contact details');
} finally {
  const saved=await db.inquiry.findUnique({where:{idempotencyKey:key},include:{event:true}});
  if(saved){assert.equal(saved.organization,input.organization);assert.equal(saved.event,null);await db.$transaction(async tx=>{await tx.inquiryRequirements.deleteMany({where:{inquiryId:saved.id}});await tx.attribution.deleteMany({where:{inquiryId:saved.id}});await tx.activityLog.deleteMany({where:{entityId:saved.id,actor:'public',action:'inquiry.created'}});await tx.inquiry.delete({where:{id:saved.id}});});console.log('CLEANUP: removed only this synthetic verification inquiry');}
  await db.$disconnect();
}