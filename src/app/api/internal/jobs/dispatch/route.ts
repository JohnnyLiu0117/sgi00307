import { timingSafeEqual } from 'node:crypto';
import { runJobs } from '@/jobs/runner';
export async function POST(req:Request){const expected=process.env.CRON_SECRET;if(!expected)return Response.json({error:'not configured'},{status:503});const actual=req.headers.get('authorization')||'',target='Bearer '+expected;if(actual.length!==target.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(target)))return Response.json({error:'unauthorized'},{status:401});return Response.json(await runJobs());}

export const maxDuration = 300;
export const GET = POST;