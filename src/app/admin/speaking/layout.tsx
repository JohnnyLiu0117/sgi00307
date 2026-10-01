import { db } from '@/db/client';
import { requireOwner } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';
export const dynamic='force-dynamic';
export const metadata={title:'講師工作室',robots:{index:false,follow:false}};
export default async function AdminLayout({children}:{children:React.ReactNode}){await requireOwner();const inboxCount=await db.inquiry.count({where:{status:{in:['inquiry','contacted','negotiating','awaiting_confirmation']}}});return <AdminShell inboxCount={inboxCount}>{children}</AdminShell>}
