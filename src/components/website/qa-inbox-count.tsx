'use client';
import { useEffect, useState } from 'react';
export function QaInboxCount(){
  const [count,setCount]=useState<number|null>(null);
  useEffect(()=>{const controller=new AbortController();const load=()=>{void fetch('/api/admin/website/status',{cache:'no-store',signal:controller.signal}).then(async response=>{if(!response.ok)throw Error('unavailable');const data=await response.json();if(!controller.signal.aborted)setCount(typeof data.pendingCount==='number'?data.pendingCount:null);}).catch(()=>{if(!controller.signal.aborted)setCount(null);});};load();const timer=window.setInterval(load,60000);return()=>{controller.abort();window.clearInterval(timer);};},[]);
  return count!==null&&count>0?<span className="inbox-count" aria-label={`${count} 則待處理問題`}>{count}</span>:null;
}
