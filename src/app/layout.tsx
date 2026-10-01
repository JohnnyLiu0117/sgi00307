import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: {default:'演講與合作｜強尼老師・劉宗騰',template:'%s｜強尼老師'}, description:'從真實教育現場出發，分享 SEL、PBL、AI 教師工作流與 IGP 學生成長歷程。教師研習、學生講座與實作工作坊。' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="zh-Hant"><body>{children}</body></html>; }