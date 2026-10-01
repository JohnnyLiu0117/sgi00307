import { z } from 'zod';
export const audienceOptions = ['國小學生','國中學生','高中學生','大學生','教師','輔導教師','行政人員','家長','社會人士','其他'];
const text = (max=200) => z.string().trim().min(1,'請填寫此欄位').max(max,'內容過長');
export const inquirySchema = z.object({
  organization:text(),contactName:text(80),email:z.email('請填寫有效 Email').max(254),phone:text(40),
  venue:text(500),region:text(40),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/,'請選擇日期'),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/,'請選擇時間'),
  durationMinutes:z.coerce.number().int().min(30).max(720),attendees:z.coerce.number().int().min(1).max(10000),
  topicId:z.string().max(100).default(''),customTopic:z.string().max(500).default(''),
  audiences:z.array(z.enum(audienceOptions as [string,...string[]])).min(1,'請選擇參與對象').max(10),ageRange:z.string().max(100).default(''),
  problems:text(3000),takeaways:text(3000),interaction:z.boolean(),workshop:z.boolean(),worksheet:z.boolean(),customContent:z.boolean(),equipment:text(1000),notes:z.string().max(3000).default(''),
  discovery:z.enum(['Google','Blog','Facebook','Instagram','他人推薦','曾參與演講','其他']),sourceUrl:z.string().max(1000).default(''),consent:z.literal(true,{error:'請確認資料使用說明'}),website:z.string().max(200).default(''),idempotencyKey:z.uuid()
}).superRefine((v,ctx)=>{if(!v.topicId&&!v.customTopic.trim())ctx.addIssue({code:'custom',path:['customTopic'],message:'請選擇講題或說明想討論的方向'});const date=new Date(`${v.date}T${v.time}:00+08:00`);if(!Number.isFinite(date.getTime()))ctx.addIssue({code:'custom',path:['date'],message:'日期無效'});if(Number.isFinite(date.getTime())&&new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)!==v.date)ctx.addIssue({code:'custom',path:['date'],message:'日期無效'});if(v.sourceUrl){try{const url=new URL(v.sourceUrl);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error();}catch{ctx.addIssue({code:'custom',path:['sourceUrl'],message:'請輸入有效文章網址'});}}});
export type InquiryInput = z.infer<typeof inquirySchema>;
export const statusLabels: Record<string,string> = {inquiry:'新邀約',contacted:'等待聯絡',negotiating:'等待報價',awaiting_confirmation:'等待確認',converted:'已轉為演講',declined:'已婉拒',confirmed:'已確認',preparing:'準備中',completed:'已完成',cancelled:'已取消'};
export function cleanSourceUrl(value:string){if(!value)return null;const u=new URL(value);u.search='';u.hash='';return u.toString();}
export function intervalOverlaps(a:Date,b:Date,c:Date,d:Date){return a<d&&b>c;}
export function taipeiDate(date:Date){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function displayDate(date:Date){return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'long',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);}