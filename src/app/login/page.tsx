import { PublicShell } from '@/components/public-shell';
import { SignInButton } from '@/components/sign-in-button';
import { authConfigured } from '@/lib/auth';
import { LockKeyhole } from 'lucide-react';
export const metadata={title:'講師工作室登入',robots:{index:false,follow:false}};
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){const {error}=await searchParams;return <PublicShell><div className="login-wrap"><div className="login-card"><LockKeyhole size={30}/><p className="eyebrow" style={{marginTop:20}}>JOHNNY’S SPEAKING STUDIO</p><h1>回到你的講師工作室。</h1><p>整理邀約、準備分享，<br/>讓每一次教育對話都有自己的位置。</p>{error&&<p className="notice error" role="alert">無法登入。請使用已指定的講師 Google 帳號；若仍有問題，請檢查登入設定。</p>}{authConfigured()?<SignInButton/>:<div className="notice">工作室正在完成 Google 登入設定，暫不開放登入。公開講題與邀約入口仍可使用。</div>}<p style={{marginTop:22,fontSize:13}}>此工作室僅開放講師本人使用。</p></div></div></PublicShell>}