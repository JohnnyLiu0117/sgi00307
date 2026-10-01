import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import { brand } from '@/lib/brand';
export function PublicShell({ children }: {children:React.ReactNode}) { return <>
  <a className="skip-link" href="#main">跳至內容</a>
  <header className="site-header"><Link className="brand" href="/speaking"><span className="brand-mark">J</span><span><strong>強尼老師</strong><small>劉宗騰｜教育設計實踐者</small></span></Link><nav aria-label="主要導覽"><a href={brand.blog+'/about'}>關於我</a><a href={brand.blog+'/articles'}>文章分享</a><a href={brand.blog+'/practice'}>教育實踐</a><Link className="active" href="/speaking">演講與合作</Link></nav><Link className="header-invite" href="/speaking/invite">提出邀約 <ArrowUpRight size={16}/></Link></header>
  <div className="subnav"><div><Link href="/speaking">演講首頁</Link><Link href="/speaking/topics">所有講題</Link><Link href="/speaking/calendar">演講行程</Link><a href={brand.blog+'/speaker-kit'}>Speaker Kit <ArrowUpRight size={13}/></a></div><span>從教育現場，走進每一次對話。</span></div>
  <main id="main">{children}</main>
  <footer className="site-footer"><div><div className="brand"><span className="brand-mark">J</span><strong>強尼老師｜劉宗騰</strong></div><p>讓教育成為一段值得相信的經驗。</p><small>© {new Date().getFullYear()} 強尼老師・教育實踐與分享</small></div><div><a href={'mailto:'+brand.email}><Mail size={16}/>{brand.email}</a><a href={brand.blog+'/speaker-kit'}>講師資料 <ArrowUpRight size={14}/></a><div className="footer-links"><Link href="/privacy">隱私說明</Link><Link href="/admin/speaking">講師工作室</Link></div></div></footer>
</>; }