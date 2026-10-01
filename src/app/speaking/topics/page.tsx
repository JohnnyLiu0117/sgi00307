import { PublicShell } from '@/components/public-shell';
import { TopicExplorer } from '@/components/topic-explorer';
import { publicTopics } from '@/services/topics';
export const dynamic='force-dynamic';
export const metadata={title:'演講主題'};
export default async function TopicsPage({searchParams}:{searchParams:Promise<{track?:string}>}){const {track}=await searchParams;const data=await publicTopics();return <PublicShell><section className="container page-intro"><p className="eyebrow">FIND YOUR CONVERSATION</p><h1>每個講題，都從真實問題開始。</h1><p>先找到你們正在關心的方向，再一起調整內容、形式與時間。</p></section><section className="container" style={{paddingBottom:60}}><TopicExplorer topics={data.map(t=>({...t,familyName:t.family.name}))} initialTrack={['teacher','student'].includes(track||'')?track:'all'}/></section></PublicShell>}