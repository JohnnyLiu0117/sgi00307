import { existsSync,readFileSync,writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
if(!existsSync('.env')){
  const text=readFileSync('.env.example','utf8').replace('NEXTAUTH_SECRET=""',`NEXTAUTH_SECRET="${randomBytes(32).toString('hex')}"`).replace('RATE_LIMIT_SECRET=""',`RATE_LIMIT_SECRET="${randomBytes(32).toString('hex')}"`);
  writeFileSync('.env',text);
  console.log('Local configuration created. Google credentials are still unset.');
}else console.log('Existing local configuration preserved.');