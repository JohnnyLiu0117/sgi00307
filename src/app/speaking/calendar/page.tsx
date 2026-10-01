import { PublicShell } from '@/components/public-shell';
import { CalendarView } from '@/components/calendar-view';
import Link from 'next/link';
export const metadata={title:'演講行程'};
export default function Calendar(){return <PublicShell><div className="container page-intro"><p className="eyebrow">MAKE ROOM FOR A CONVERSATION</p><h1>找一個適合對話的日子。</h1><p>這裡僅顯示日期狀態，不公開私人行程。可洽詢不代表已保留，活動仍需雙方確認。</p></div><section className="container calendar-content"><CalendarView/><p>當天已有行程，也可以在邀約中提出其他時段，我們再一起確認。</p><Link className="button" href="/speaking/invite">提出日期與演講需求 →</Link></section></PublicShell>}