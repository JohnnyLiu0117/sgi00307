import { Prisma } from '@prisma/client';
import { db } from '@/db/client';
const checklist=[['topic','主題確認'],['outline','大綱完成'],['script','講稿完成'],['slides','簡報完成'],['poster','宣傳海報'],['worksheet','學習單'],['preflight','行前確認'],['event','演講完成'],['review','回饋完成']];
export type ConfirmInput={inquiryId:string;rowVersion:number;topicVersionId:string;fee?:number;actor:string};
export async function confirmInquiry(v:ConfirmInput){return db.$transaction(async tx=>{
  await tx.counter.update({where:{id:'speaker-lock'},data:{value:{increment:1}}});
  const i=await tx.inquiry.findUniqueOrThrow({where:{id:v.inquiryId},include:{requirements:true,event:true}});
  if(i.event)return i.event;
  if(i.rowVersion!==v.rowVersion)throw new Error('資料已被更新，請重新載入');
  if(['cancelled','declined','converted'].includes(i.status))throw new Error('此邀約不能直接確認');
  const version=await tx.topicVersion.findUniqueOrThrow({where:{id:v.topicVersionId},include:{topic:true}});
  if(i.topicId&&version.topicId!==i.topicId)throw new Error('請使用此邀約主題的版本');
  const endsAt=new Date(i.startsAt.getTime()+version.durationMinutes*60000);
  if(await tx.calendarBlock.findFirst({where:{active:true,startsAt:{lt:endsAt},endsAt:{gt:i.startsAt}}}))throw new Error('這段時間已有行程，請先調整日期');
  const counter=await tx.counter.upsert({where:{id:String(new Date().getFullYear())},create:{id:String(new Date().getFullYear()),value:1},update:{value:{increment:1}}});
  const org=await tx.organization.create({data:{name:i.organization}});
  const contact=await tx.contact.create({data:{organizationId:org.id,name:i.contactName,email:i.email,phone:i.phone}});
  const event=await tx.speakingEvent.create({data:{code:`SPK-${counter.id}-${String(counter.value).padStart(3,'0')}`,inquiryId:i.id,organizationId:org.id,contactId:contact.id,topicVersionId:version.id,title:version.topic.title,startsAt:i.startsAt,endsAt,venue:i.venue,region:i.region,attendees:i.attendees,durationMinutes:version.durationMinutes,fee:v.fee,confirmedBy:v.actor,requirements:JSON.parse(JSON.stringify(i.requirements||{})) as Prisma.InputJsonValue,checklist:{create:checklist.map(([code,label])=>({code,label,completed:code==='topic',required:!['poster','worksheet','review'].includes(code)||code==='worksheet'&&!!i.requirements?.worksheet}))}}});
  await tx.preparationTask.createMany({data:[['參與人數與需求確認',14],['場地設備與當日窗口',7],['簡報與講義定稿',3],['交通與抵達時間',1]].map(([label,days])=>({eventId:event.id,label:String(label),dueAt:new Date(event.startsAt.getTime()-Number(days)*86400000)}))});
  await tx.calendarBlock.create({data:{eventId:event.id,sourceKey:'event:'+event.id,source:'local_event',kind:'busy',startsAt:event.startsAt,endsAt:event.endsAt}});
  await tx.outboxJob.create({data:{eventId:event.id,version:1,dedupeKey:event.id+':1'}});
  await tx.inquiry.update({where:{id:i.id},data:{status:'converted',rowVersion:{increment:1}}});
  await tx.activityLog.create({data:{actor:v.actor,action:'event.confirmed',entityId:event.id}});
  return event;
},{timeout:15000});}
export async function changeEvent(v:{id:string;rowVersion:number;action:'reschedule'|'cancel'|'prepare'|'complete';startsAt?:Date;actor:string}){return db.$transaction(async tx=>{
  await tx.counter.update({where:{id:'speaker-lock'},data:{value:{increment:1}}});
  const e=await tx.speakingEvent.findUniqueOrThrow({where:{id:v.id}});
  if(e.rowVersion!==v.rowVersion)throw new Error('資料已更新，請重新載入');
  if(['cancelled','completed'].includes(e.status))throw new Error('已結案活動不能變更');
  const start=v.startsAt||e.startsAt,end=new Date(start.getTime()+e.durationMinutes*60000);
  if(v.action==='reschedule'&&await tx.calendarBlock.findFirst({where:{active:true,NOT:{sourceKey:'event:'+e.id},startsAt:{lt:end},endsAt:{gt:start}}}))throw new Error('新時段已有行程');
  const status=v.action==='cancel'?'cancelled':v.action==='prepare'?'preparing':v.action==='complete'?'completed':e.status;
  const updated=await tx.speakingEvent.update({where:{id:e.id},data:{status,startsAt:start,endsAt:end,rowVersion:{increment:1}}});
  await tx.calendarBlock.update({where:{sourceKey:'event:'+e.id},data:{startsAt:start,endsAt:end,active:status!=='cancelled'}});
  if(v.action==='complete')await tx.checklistItem.updateMany({where:{eventId:e.id,code:'event'},data:{completed:true}});
  await tx.outboxJob.create({data:{eventId:e.id,version:updated.rowVersion,dedupeKey:e.id+':'+updated.rowVersion}});
  await tx.activityLog.create({data:{actor:v.actor,action:'event.'+v.action,entityId:e.id}});return updated;
},{timeout:15000});}
