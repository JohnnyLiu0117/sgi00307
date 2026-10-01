import Link from 'next/link';
import { PublicShell } from '@/components/public-shell';
export const metadata={title:'謝謝你的邀約',robots:{index:false,follow:false}};
export default function Thanks(){return <PublicShell><section className="prose" style={{textAlign:'center',minHeight:500}}><p className="eyebrow">THANK YOU FOR REACHING OUT</p><h1>謝謝你，讓對話開始。</h1><p>若您剛完成送出，邀約已進入講師的待處理清單。<br/>後續將透過您提供的聯絡方式討論細節。</p><div className="notice">活動尚需講師確認；此頁不是預約成立或付款證明。</div><Link className="button" href="/speaking/topics">繼續探索演講主題 →</Link></section></PublicShell>}