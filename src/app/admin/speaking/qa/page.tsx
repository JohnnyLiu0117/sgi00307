import { requireOwner } from '@/lib/auth';
import { brand } from '@/lib/brand';
import { QaStudioManager } from '@/components/website/qa-studio-manager';
export default async function QaInbox(){await requireOwner();return <><div className="admin-heading"><div><p className="eyebrow">READER QUESTIONS</p><h1>教育 Q&amp;A 收件匣</h1></div><a className="button secondary" href={brand.blog+'/qa'} target="_blank" rel="noreferrer">查看公開 Q&amp;A ↗</a></div><div className="website-cms"><QaStudioManager/></div></>;}
