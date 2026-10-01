'use client';
import { signIn,signOut } from 'next-auth/react';
export function SignInButton(){return <button className="button" onClick={()=>signIn('google',{callbackUrl:'/admin/speaking'})}>使用 Google 登入工作室 →</button>}
export function SignOutButton(){return <button className="chip" onClick={()=>signOut({callbackUrl:'/speaking'})}>登出</button>}