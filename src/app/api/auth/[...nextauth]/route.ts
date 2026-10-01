import NextAuth from 'next-auth';
import { authOptions, authConfigured } from '@/lib/auth';
const authHandler=NextAuth(authOptions);
async function handler(req:Request,context:unknown){if(!authConfigured())return Response.json({error:'登入服務尚未設定'},{status:503});return authHandler(req,context);}
export {handler as GET,handler as POST};