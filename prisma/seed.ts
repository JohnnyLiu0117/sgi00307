try { process.loadEnvFile(); } catch {}
import { db } from '../src/db/client';
import { topics, articleUrl } from '../src/data/topics';
await db.counter.upsert({where:{id:'speaker-lock'},create:{id:'speaker-lock'},update:{}});
for (const t of topics) {
  await db.topicFamily.upsert({where:{id:t.family},create:{id:t.family,name:t.familyName},update:{}});
  await db.topic.upsert({where:{id:t.id},create:{id:t.id,slug:t.id,familyId:t.family,title:t.title,summary:t.summary,audience:t.audience,track:t.track,outcomes:t.outcomes,caveat:t.caveat,published:true,sortOrder:topics.indexOf(t)},update:{}});
  for (const o of t.offerings) await db.topicOffering.upsert({where:{topicId_label:{topicId:t.id,label:o.label}},create:{topicId:t.id,label:o.label,minMinutes:o.min,maxMinutes:o.max},update:{}});
  const article = await db.article.upsert({where:{url:articleUrl(t)},create:{id:t.article.path,title:t.article.title,url:articleUrl(t)},update:{}});
  await db.articleTopic.upsert({where:{articleId_topicId:{articleId:article.id,topicId:t.id}},create:{articleId:article.id,topicId:t.id},update:{}});
}
console.log('Seeded 12 real public topics. No inquiries, events, reviews or invented outlines were seeded.');
await db.$disconnect();