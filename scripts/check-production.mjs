// Checks presence and shape only; never prints environment values or secrets.
try { process.loadEnvFile(); } catch {}
const issues=[];
for(const key of ['DATABASE_URL','NEXTAUTH_URL','NEXT_PUBLIC_SITE_URL','NEXTAUTH_SECRET','RATE_LIMIT_SECRET','CRON_SECRET','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','OWNER_GOOGLE_SUB']) {
  if(!process.env[key]?.trim())issues.push(`${key}: missing`);
}
for(const key of ['NEXTAUTH_SECRET','RATE_LIMIT_SECRET','CRON_SECRET']) {
  if(process.env[key]&&process.env[key].length<32)issues.push(`${key}: must be at least 32 characters`);
}
for(const key of ['NEXTAUTH_URL','NEXT_PUBLIC_SITE_URL','DATABASE_URL']) {
  if(!process.env[key])continue;
  try {
    const url=new URL(process.env[key]);
    if(['localhost','127.0.0.1','::1','[::1]'].includes(url.hostname))issues.push(`${key}: local address cannot be used in production`);
    if(key!=='DATABASE_URL'&&url.protocol!=='https:')issues.push(`${key}: HTTPS required`);
  } catch { issues.push(`${key}: invalid URL`); }
}
if(process.env.NEXTAUTH_URL!==process.env.NEXT_PUBLIC_SITE_URL)issues.push('Site origins must match');
if(process.env.OWNER_EMAIL!=='sgi00307@gmail.com')issues.push('OWNER_EMAIL: unexpected owner');
if(issues.length){console.error('Production setup incomplete:\n'+issues.map(x=>' - '+x).join('\n'));process.exitCode=1;}
else console.log('Production configuration shape passed; live database and OAuth verification still required.');