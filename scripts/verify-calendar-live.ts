import {randomUUID} from 'node:crypto';
import {db} from '../src/db/client';
import {syncEvent,googleConfig,accessToken,externalEventId} from '../src/integrations/google/calendar';
const run=randomUUID(),topicId='calendar-test-'+run;
let eventId:string|undefined,orgId:string|undefined,contactId:string|undefined,versionId:string|undefined,clean=false;
try{
 const config=await googleConfig();
 if(config.calendarId!=='4642cda16f14cf6b00cf65e0febb270928457da05b4804b58feadd603312e096@group.calendar.google.com')throw new Error('Unexpected calendar; stopped');
 const family=await db.topicFamily.findFirstOrThrow();
 await db.topic.create({data:{id:topicId,slug:topicId,familyId:family.id,title:'系統串接驗證（自動清除）',summary:'臨時驗證資料',audience:'test',track:'teacher',outcomes:[],published:false}});
 versionId=(await db.topicVersion.create({data:{topicId,version:1,label:'temporary',audience:'test',durationMinutes:30,outline:'temporary'}})).id;
 orgId=(await db.organization.create({data:{name:'系統驗證 '+run}})).id;
 contactId=(await db.contact.create({data:{organizationId:orgId,name:'系統驗證',email:'test@example.invalid',phone:'test'}})).id;
 eventId=(await db.speakingEvent.create({data:{code:'VERIFY-'+run,organizationId:orgId,contactId,topicVersionId:versionId,title:'系統串接驗證（自動清除）',startsAt:new Date('2031-12-01T01:00:00Z'),endsAt:new Date('2031-12-01T01:30:00Z'),venue:'test',region:'test',attendees:1,durationMinutes:30,requirements:{},confirmedBy:'verification'}})).id;
 const url=`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events/${externalEventId(eventId)}`;
 const read=async()=>fetch(url,{headers:{Authorization:'Bearer '+await accessToken()},signal:AbortSignal.timeout(15000)});
 await syncEvent(eventId);let r=await read();if(!r.ok)throw new Error('Create verification failed');const created=await r.json();if(created.extendedProperties?.private?.speakingEventId!==eventId)throw new Error('Wrong event identity');console.log('Calendar create verified');
 await db.speakingEvent.update({where:{id:eventId},data:{startsAt:new Date('2031-12-01T02:00:00Z'),endsAt:new Date('2031-12-01T02:30:00Z'),rowVersion:2}});await syncEvent(eventId);r=await read();const updated=await r.json();if(!r.ok||new Date(updated.start.dateTime).toISOString()!=='2031-12-01T02:00:00.000Z')throw new Error('Update verification failed');console.log('Calendar update verified');
 await db.speakingEvent.update({where:{id:eventId},data:{status:'cancelled',rowVersion:3}});await syncEvent(eventId);r=await read();if(![404,410].includes(r.status)){const deleted=await r.json();if(deleted.status!=='cancelled')throw new Error('Cancel verification failed');}clean=true;console.log('Calendar cancel verified');
}catch(e){console.error('Calendar verification incomplete:',(e as Error).message);process.exitCode=1;}
finally{
 if(eventId&&!clean){try{await db.speakingEvent.update({where:{id:eventId},data:{status:'cancelled'}});await syncEvent(eventId);clean=true;}catch{console.error('Temporary calendar event retained for cleanup; do not claim success.');}}
 if(!eventId||clean){if(eventId)await db.speakingEvent.delete({where:{id:eventId}});if(contactId)await db.contact.delete({where:{id:contactId}});if(orgId)await db.organization.delete({where:{id:orgId}});if(versionId)await db.topicVersion.delete({where:{id:versionId}});await db.topic.deleteMany({where:{id:topicId}});console.log('Temporary verification records cleaned');}
 await db.$disconnect();
}