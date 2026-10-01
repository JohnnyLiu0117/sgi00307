import Link from 'next/link';
import { requireOwner } from '@/lib/auth';
import { brand } from '@/lib/brand';
import { WebsiteManager } from '@/components/website/manager';
export default async function WebsitePage(){await requireOwner();return <><div className="admin-heading"><div><p className="eyebrow">WEBSITE MANAGEMENT</p><h1>網站內容管理</h1></div><a className="button secondary" href={brand.blog} target="_blank" rel="noreferrer">查看公開網站 ↗</a></div><p>在工作室管理文章、人物介紹、研究成果、教育案例與真實照片。單檔上限 4MB，較大檔案可從<a href={brand.blog+'/studio'} target="_blank" rel="noreferrer">備援網站後台</a>上傳。</p><p><Link href="/admin/speaking/qa">查看 Q&amp;A 收件匣 →</Link></p><WebsiteManager/></>;}
