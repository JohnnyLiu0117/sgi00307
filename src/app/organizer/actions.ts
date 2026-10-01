'use server';
import { z } from 'zod';
import { db } from '@/db/client';
import { findPortal } from '@/services/studio-workflow';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
export async function organizerAction(f:FormData){
  const token=String(f.get('token')||''),p=await findPortal(token);if(!p)throw new Error('連結已失效，請聯絡講師');
  const action=String(f.get('action'));
  if(action==='confirm'){
    const notes=z.string().trim().max(4000).parse(f.get('notes'));await db.organizerPortal.update({where:{id:p.id},data:{organizerNotes:notes,confirmedAt:new Date()}});
  }else if(action==='accept'){
    if(f.get('confirm')!=='on')throw new Error('請確認報價內容');const quoteId=z.uuid().parse(f.get('quoteId'));const name=z.string().trim().min(1).max(100).parse(f.get('name'));
    const r=await db.quote.updateMany({where:{id:quoteId,inquiryId:p.inquiryId,status:'issued',validUntil:{gte:new Date()}},data:{status:'accepted',acceptedName:name,acceptedAt:new Date()}});if(!r.count)throw new Error('報價已更新或過期，請重新載入');
  }else if(action==='feedback'){
    if(!p.inquiry.event||p.inquiry.event.endsAt>new Date()||p.inquiry.event.status==='cancelled')throw new Error('活動結束後才開放回饋');
    const rating=z.coerce.number().int().min(1).max(5).parse(f.get('rating')),name=z.string().trim().min(1).max(100).parse(f.get('name')),comment=z.string().trim().min(1).max(4000).parse(f.get('comment')),takeaway=z.string().trim().min(1).max(4000).parse(f.get('takeaway'));const photoUrl=String(f.get('photoUrl')||'').trim();if(photoUrl&&(new URL(z.url().parse(photoUrl)).protocol!=='https:'))throw new Error('照片請提供 HTTPS 分享網址');
    await db.feedback.upsert({where:{portalId:p.id},create:{portalId:p.id,rating,name,comment,takeaway,photoUrl,publishConsent:f.get('publishConsent')==='on'},update:{rating,name,comment,takeaway,photoUrl,publishConsent:f.get('publishConsent')==='on',published:false}});
    revalidatePath('/speaking/stories');
  }else throw new Error('操作無效');
  revalidatePath('/admin/speaking','layout');revalidatePath('/organizer/'+token);redirect('/organizer/'+token+'?saved=1');
}