import { publicTopics } from '@/services/topics';
export async function GET(){try{return Response.json({topics:await publicTopics()});}catch{return Response.json({error:'主題服務暫時無法使用'},{status:503});}}