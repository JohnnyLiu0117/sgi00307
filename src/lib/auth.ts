import { getServerSession, type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { redirect } from 'next/navigation';
import { db } from '@/db/client';
export const authConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.NEXTAUTH_SECRET);
export const authOptions: NextAuthOptions = {
  providers: [GoogleProvider({clientId:process.env.GOOGLE_CLIENT_ID||'',clientSecret:process.env.GOOGLE_CLIENT_SECRET||'',authorization:{params:{prompt:'select_account',scope:'openid email profile'}}})],
  session:{strategy:'jwt',maxAge:8*60*60},secret:process.env.NEXTAUTH_SECRET,
  pages:{signIn:'/login',error:'/login'},
  callbacks:{
    async signIn({account,profile}) {
      const p=profile as {sub?:string;email?:string;email_verified?:boolean};
      if(account?.provider!=='google'||!p?.sub||!p.email_verified||p.email?.toLowerCase()!==(process.env.OWNER_EMAIL||'sgi00307@gmail.com').toLowerCase())return false;
      if(process.env.OWNER_GOOGLE_SUB&&p.sub!==process.env.OWNER_GOOGLE_SUB)return false;
      const existing=await db.user.findUnique({where:{email:p.email!.toLowerCase()}});
      if(existing)return existing.enabled&&existing.googleSubject===p.sub;
      // Production requires an explicitly pinned subject; no first-login takeover.
      if(process.env.NODE_ENV==='production'&&!process.env.OWNER_GOOGLE_SUB)return false;
      try {await db.user.create({data:{email:p.email!.toLowerCase(),googleSubject:p.sub}});return true;}catch{return false;}
    },
    async jwt({token,account}){if(account)token.ownerSubject=account.providerAccountId;return token;},
    async session({session,token}){(session as typeof session & {ownerSubject?:unknown}).ownerSubject=token.ownerSubject;return session;}
  }
};
export async function requireOwner(){
  if(!authConfigured())redirect('/login');
  const session=await getServerSession(authOptions) as {ownerSubject?:string}|null;
  if(!session?.ownerSubject)redirect('/login');
  const user=await db.user.findUnique({where:{googleSubject:session.ownerSubject}});
  if(!user?.enabled||user.email!==(process.env.OWNER_EMAIL||'sgi00307@gmail.com').toLowerCase())redirect('/login?error=AccessDenied');
  return user;
}