'use client';
import { useState } from 'react';
import { TopicCard,type TopicCardData } from './topic-card';
export function TopicExplorer({topics,initialTrack='all'}:{topics:(TopicCardData&{familyId:string})[];initialTrack?:string}){
  const [track,setTrack]=useState(initialTrack),[family,setFamily]=useState('all'),[q,setQ]=useState('');
  const families=Array.from(new Map(topics.map(t=>[t.familyId,t.familyName.split(' × ')[0]])).entries());
  const visible=topics.filter(t=>(track==='all'||t.track===track)&&(family==='all'||t.familyId===family)&&`${t.title}${t.summary}${t.audience}`.toLowerCase().includes(q.toLowerCase()));
  return <><div className="filters" aria-label="分享對象">{[['all','全部分享'],['teacher','教師研習'],['student','學生講座']].map(([v,l])=><button className={'chip '+(track===v?'selected':'')} key={v} onClick={()=>setTrack(v)} aria-pressed={track===v}>{l}</button>)}</div><div className="search-row"><div className="filters" style={{margin:0}}><button className={'chip '+(family==='all'?'selected':'')} onClick={()=>setFamily('all')}>所有領域</button>{families.map(([v,l])=><button key={v} className={'chip '+(family===v?'selected':'')} onClick={()=>setFamily(v)} aria-pressed={family===v}>{l}</button>)}</div><input aria-label="搜尋講題" placeholder="搜尋講題、對象或關鍵字…" value={q} onChange={e=>setQ(e.target.value)}/></div><p className="result-count" aria-live="polite">找到 {visible.length} 個適合展開對話的主題</p><div className="topic-grid">{visible.map((t,i)=><TopicCard key={t.id} topic={t} index={i}/>)}</div>{!visible.length&&<div className="empty">沒有符合的講題，試試其他關鍵字，或在邀約時提出你的想法。</div>}</>;
}