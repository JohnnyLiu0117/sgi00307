import { db } from '@/db/client';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    if (!process.env.DATABASE_URL || !process.env.RATE_LIMIT_SECRET) throw new Error('NOT_READY');
    await db.$queryRaw`SELECT 1`;
    const ready = await db.counter.findUnique({where:{id:'speaker-lock'},select:{id:true}});
    if (!ready) throw new Error('NOT_READY');
    return Response.json({status:'ok'}, {headers:{'Cache-Control':'no-store'}});
  } catch {
    return Response.json({status:'unavailable'}, {status:503,headers:{'Cache-Control':'no-store'}});
  }
}