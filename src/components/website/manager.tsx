'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Articles=dynamic(()=>import('./studio-editor').then(m=>m.StudioEditor));
const Profile=dynamic(()=>import('./profile-manager').then(m=>m.ProfileManager));
const Evidence=dynamic(()=>import('./profile-entries-manager').then(m=>m.ProfileEntriesManager));
const Content=dynamic(()=>import('./content-manager').then(m=>m.ContentManager));
const Media=dynamic(()=>import('./media-library-manager').then(m=>m.MediaLibraryManager));
const Analytics=dynamic(()=>import('./analytics-summary').then(m=>m.AnalyticsSummary));
const tabs=[['articles','文章'],['profile','人物介紹'],['evidence','研究與成果'],['content','案例與合作'],['media','照片與素材'],['analytics','網站瀏覽']] as const;
export function WebsiteManager(){
  const [tab,setTab]=useState<string>('articles');
  const [status,setStatus]=useState<'loading'|'connected'|'error'>('loading');
  const [error,setError]=useState('');
  const [revision,setRevision]=useState(0);
  useEffect(()=>{const onError=(event:Event)=>setError((event as CustomEvent<string>).detail);window.addEventListener('website-error',onError);return()=>window.removeEventListener('website-error',onError);},[]);
  useEffect(()=>{const controller=new AbortController();setStatus('loading');void fetch('/api/admin/website/status',{cache:'no-store',signal:controller.signal}).then(async response=>{const result=await response.json();if(!response.ok)throw Error(result.error||'無法讀取網站資料。');setStatus('connected');}).catch(e=>{if(!controller.signal.aborted){setError(e instanceof Error?e.message:'連線未完成。');setStatus('error');}});return()=>controller.abort();},[revision]);
  if(status==='loading')return <p role="status">正在連接網站資料…</p>;
  if(status==='error')return <div className="notice error" role="alert"><p>{error}</p><button className="button secondary" onClick={()=>setRevision(r=>r+1)}>重試連線</button></div>;
  return <div className="website-cms">{error&&<p className="notice error" role="alert">{error}</p>}<div className="filters">{tabs.map(([id,label])=><button type="button" key={id} className={`chip ${tab===id?'selected':''}`} aria-pressed={tab===id} onClick={()=>{setError('');setTab(id);}}>{label}</button>)}</div>{tab==='articles'?<Articles/>:tab==='profile'?<Profile/>:tab==='evidence'?<Evidence/>:tab==='content'?<Content/>:tab==='media'?<Media/>:<Analytics/>}</div>;
}
