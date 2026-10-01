import Link from 'next/link';
export default function NotFound(){return <div className="prose"><h1>找不到這個頁面。</h1><p>內容可能已調整，從演講首頁繼續探索。</p><Link className="button" href="/speaking">回到演講首頁</Link></div>}