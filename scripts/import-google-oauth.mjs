import {readFile,writeFile} from 'node:fs/promises';
// Import the Google Console download without printing credentials.
const file=process.argv[2]||'.local/google-oauth.json';
const payload=JSON.parse(await readFile(file,'utf8'));
const client=payload.web;
if(!client?.client_id?.endsWith('.apps.googleusercontent.com')||!client.client_secret)throw new Error('需要 Google 網頁應用程式的 OAuth 用戶端 JSON');
const expected=['https://johnny-edu-speaking-hub.vercel.app/api/auth/callback/google','https://johnny-edu-speaking-hub.vercel.app/api/google/callback','http://localhost:3000/api/auth/callback/google','http://localhost:3000/api/google/callback'];
if(expected.some(uri=>!client.redirect_uris?.includes(uri)))throw new Error('OAuth 回呼網址不完整，請依 docs/14-google-production-setup.md 設定後重新下載');
let env=await readFile('.env','utf8');
for(const [key,value] of Object.entries({GOOGLE_CLIENT_ID:client.client_id,GOOGLE_CLIENT_SECRET:client.client_secret})){
  const line=key+'='+JSON.stringify(value);
  const pattern=new RegExp('^'+key+'=.*$','m');
  env=pattern.test(env)?env.replace(pattern,()=>line):env+'\n'+line+'\n';
}
await writeFile('.env',env);
console.log('Google OAuth 本機設定已匯入；尚未上傳正式環境，需先完成講師帳號驗證。');