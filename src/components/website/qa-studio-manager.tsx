'use client';
import { useCallback, useEffect, useState } from 'react';
type QaRow={id:number;question:string;askerName:string|null;askerRole:string|null;sourcePath:string|null;sourceTitle:string|null;aiAnswer:string|null;humanAnswer:string|null;status:string;safetyLevel:string;isPublic:number;createdAt:number};
const labels:Record<string,string>={pending:'等待處理',ai_answered:'AI 草稿完成',needs_human:'需要本人處理',answered:'本人草稿完成',published:'已公開',archived:'已封存'};
const website='https://john-liu-edu.sgi00307.chatgpt.site';
export function QaStudioManager(){
  const [rows,setRows]=useState<QaRow[]>([]);
  const [drafts,setDrafts]=useState<Record<number,string>>({});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [filter,setFilter]=useState('pending');
  const [busy,setBusy]=useState<number|null>(null);
  const [assistant,setAssistant]=useState({enabled:false,model:null as string|null});
  const load=useCallback(async(signal?:AbortSignal)=>{
    setLoading(true);setError('');
    try{const response=await fetch('/api/admin/website/qa',{cache:'no-store',signal});const payload=await response.json();if(!response.ok)throw Error(payload.error||'無法讀取提問。');setRows(payload.items||[]);setAssistant({enabled:Boolean(payload.assistant?.enabled),model:payload.assistant?.model||null});}
    catch(e){if(!signal?.aborted)setError(e instanceof Error?e.message:'讀取未完成。');}
    finally{if(!signal?.aborted)setLoading(false);}
  },[]);
  useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort();},[load]);
  async function update(row:QaRow,action:'save'|'publish'|'archive'|'generate_ai'){
    if(busy!==null)return;
    if(action==='publish'&&!window.confirm('確認將這則問題與回覆公開在網站 Q&A？'))return;
    setBusy(row.id);setError('');setMessage('');
    try{const response=await fetch('/api/admin/website/qa/'+row.id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({action,humanAnswer:drafts[row.id]??row.humanAnswer??''})});const result=await response.json();if(!response.ok)throw Error(result.error||'更新未完成。');setRows(current=>current.map(item=>item.id===row.id?result:item));if(action!=='generate_ai')setDrafts(current=>{const next={...current};delete next[row.id];return next;});setMessage(action==='generate_ai'?'AI 草稿已產生，請檢視內容後再公開。':action==='publish'?'回覆已公開。':action==='archive'?'問題已封存。':'草稿已儲存。');}
    catch(e){setError(e instanceof Error?e.message:'操作未完成。');}
    finally{setBusy(null);}
  }
  const pending=rows.filter(row=>!['published','archived'].includes(row.status)).length;
  const shown=rows.filter(row=>filter==='all'||(filter==='pending'?!['published','archived'].includes(row.status):row.status===filter));
  return <section className="qa-studio-manager panel"><div className="studio-section-heading"><div><h2>讀者提問</h2><p>AI 草稿可由你修改，確認後再公開回覆。</p></div><strong>{loading?'讀取中…':error?'連線待確認':`${pending} 則待處理`}</strong></div>
    {error&&<p role="alert" className="notice error">{error}</p>}{message&&<p role="status" className="notice success">{message}</p>}
    <div className="filters"><select aria-label="問題狀態" value={filter} onChange={e=>setFilter(e.target.value)}><option value="pending">待處理</option><option value="published">已公開</option><option value="archived">已封存</option><option value="all">全部問題</option></select><button className="button secondary" disabled={loading||busy!==null} onClick={()=>void load()}>重新整理</button></div>
    {!loading&&!error&&<p>AI 助手：{assistant.enabled?'已設定':'尚未設定'}{assistant.model?`（${assistant.model}）`:''}。{!assistant.enabled&&'仍可直接填寫本人回覆。'}</p>}
    {!loading&&!error&&shown.length===0&&<p className="empty">目前沒有符合條件的提問。</p>}
    <div className="qa-studio-list">{shown.map(row=><article key={row.id} className={row.safetyLevel==='standard'?'':'is-sensitive'}><div className="qa-studio-meta"><span>#{row.id}</span><span>{labels[row.status]||row.status}</span><time>{new Date(row.createdAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'})}</time>{row.safetyLevel!=='standard'&&<span>需本人判斷</span>}</div><h3>{row.question}</h3><p>{[row.askerName,row.askerRole].filter(Boolean).join('｜')||'匿名提問'}</p>{row.sourcePath?.startsWith('/')&&!row.sourcePath.startsWith('//')&&<a href={website+row.sourcePath} target="_blank" rel="noreferrer">來源：{row.sourceTitle||row.sourcePath}</a>}{row.aiAnswer&&<blockquote><strong>AI 草稿</strong>{row.aiAnswer}</blockquote>}<label htmlFor={`answer-${row.id}`}>本人回覆／修正版</label><textarea id={`answer-${row.id}`} disabled={busy===row.id} value={drafts[row.id]??row.humanAnswer??''} onChange={e=>setDrafts(current=>({...current,[row.id]:e.target.value}))} maxLength={6000}/><div className="qa-studio-actions">{!row.aiAnswer&&!['published','archived'].includes(row.status)&&<button className="button secondary" disabled={!assistant.enabled||busy!==null} onClick={()=>void update(row,'generate_ai')}>{busy===row.id?'處理中…':'生成 AI 草稿'}</button>}{row.aiAnswer&&<button className="button secondary" disabled={busy!==null} onClick={()=>setDrafts(current=>({...current,[row.id]:row.aiAnswer!}))}>載入 AI 草稿編輯</button>}<button className="button secondary" disabled={busy!==null} onClick={()=>void update(row,'save')}>儲存草稿</button><button className="button" disabled={busy!==null||!(drafts[row.id]??row.humanAnswer??row.aiAnswer)?.trim()} onClick={()=>void update(row,'publish')}>公開回覆</button>{row.status!=='archived'&&<button className="button secondary" disabled={busy!==null} onClick={()=>void update(row,'archive')}>封存</button>}</div></article>)}</div></section>;
}
