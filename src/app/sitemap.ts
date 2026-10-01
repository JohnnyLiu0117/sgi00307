import { publicTopics } from '@/services/topics';
import { origin } from '@/lib/brand';
export const dynamic='force-dynamic';
export default async function sitemap(){const topics=await publicTopics();return ['/speaking','/speaking/topics','/speaking/calendar','/speaking/invite',...topics.map(t=>'/speaking/topics/'+t.slug)].map(path=>({url:origin+path}));}