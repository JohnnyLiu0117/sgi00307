"use client";
import { websiteFetch } from "./request";

import { useEffect, useState } from "react";

type AnalyticsData = {
  counts: Record<string, number>;
  overview: { totalPageViews: number; articleViews: number; speakerKitClicks: number; invitationClicks: number };
  topArticles: Array<{ page: string; title: string; views: number }>;
  topPages: Array<{ page: string; views: number }>;
  invitationSources: Array<{ source: string; page: string; clicks: number }>;
};

const overviewLabels: Array<[keyof AnalyticsData["overview"], string]> = [
  ["totalPageViews", "全站累積瀏覽"],
  ["articleViews", "文章累積閱讀"],
  ["speakerKitClicks", "Speaker Kit 點擊"],
  ["invitationClicks", "邀約表單點擊"],
];

const sourceLabels: Record<string, string> = {
  "speaking-hero": "Speaking 首屏",
  speaking: "Speaking 頁",
  "homepage-speaking": "首頁講題區",
  "homepage-final": "首頁最終邀約",
  "speaker-kit": "Speaker Kit 頁",
  article: "文章內頁",
  "speaking-ai-workflow": "AI 教師工作流講題",
  "speaking-sel-classroom": "SEL 班級與課程講題",
  "speaking-pbl-problems": "PBL 真實問題講題",
  "speaking-igp-growth": "IGP 學生成長歷程講題",
  "speaking-student-sel": "學生 SEL 講題",
  "speaking-student-relationship": "學生情感教育講題",
  "speaking-student-career": "學生生涯探索講題",
  "speaking-student-ai": "學生 AI 講題",
  "speaking-student-pbl": "學生 PBL 講題",
  "speaking-student-research": "學生研究講題",
  "speaker-kit-ai-workflow": "Speaker Kit・AI 教師工作流",
  "speaker-kit-sel-classroom": "Speaker Kit・SEL 班級與課程",
  "speaker-kit-pbl-problems": "Speaker Kit・PBL 真實問題",
  "speaker-kit-igp-growth": "Speaker Kit・IGP 學生成長歷程",
};

export function AnalyticsSummary() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  useEffect(() => { void websiteFetch("/api/admin/website/events", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((value) => setData(value)); }, []);
  return <section className="analytics-summary analytics-summary-v152">
    <div className="analytics-intro"><p className="overline">PRIVATE SITE INSIGHTS</p><h2>網站瀏覽與邀約轉換</h2><p>從 V15.1 起匿名累積，只記錄頁面、入口與按鈕類型，不蒐集姓名、Email、表單內容或個人身分。</p></div>
    <div className="analytics-overview">{overviewLabels.map(([key, label]) => <article key={key}><strong>{data ? data.overview[key].toLocaleString("zh-TW") : "—"}</strong><span>{label}</span></article>)}</div>
    <div className="analytics-ranking"><div><h3>最多人閱讀的文章</h3>{data?.topArticles.length ? <ol>{data.topArticles.map((item) => <li key={item.page}><span>{item.title}</span><strong>{item.views.toLocaleString("zh-TW")}</strong></li>)}</ol> : <p>累積瀏覽後，這裡會顯示文章排行。</p>}</div><div><h3>邀約點擊來自哪裡</h3>{data?.invitationSources.length ? <ol>{data.invitationSources.map((item) => <li key={`${item.source}-${item.page}`}><span><b>{sourceLabels[item.source] || item.source}</b><small>{item.page}</small></span><strong>{item.clicks.toLocaleString("zh-TW")}</strong></li>)}</ol> : <p>產生邀約點擊後，這裡會顯示入口來源。</p>}</div></div>
  </section>;
}
