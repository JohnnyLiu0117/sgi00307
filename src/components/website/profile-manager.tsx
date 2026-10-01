"use client";
import { websiteFetch } from "./request";

import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { Button } from "./ui";
import { Input } from "./ui";
import { Textarea } from "./ui";

type Profile = Record<string, string | number | null | undefined>;

const groups = [
  { title: "基本人物資料", fields: [["name", "姓名"], ["brandName", "品牌名稱"], ["currentPosition", "現職"], ["currentRoles", "現任角色"], ["formerRoles", "曾任"]] },
  { title: "教學與專業", fields: [["teachingFields", "教學領域"], ["researchFields", "研究領域"], ["professionalTopics", "專業主題"], ["clubGuidance", "社團指導"], ["competitionGuidance", "競賽指導"], ["teacherCommunityRoles", "教師社群角色"], ["schoolCurriculumRoles", "校本課程角色"], ["crossSchoolTeaching", "跨校教學"]] },
  { title: "代表成果", fields: [["signatureCourses", "代表課程"], ["signatureResearch", "代表研究"], ["signatureProjects", "代表專案"], ["education", "學歷"], ["teacherTraining", "教育／師培歷程"], ["speakingRecords", "演講紀錄"], ["awards", "獎項"], ["mediaCoverage", "媒體／報導"]] },
] as const;

const initial: Profile = {
  id: 1,
  name: "劉宗騰",
  brandName: "強尼老師",
  currentPosition: "嘉義市宏仁中學｜綜合活動科任教師、輔導教師；高中生涯規劃與研究法授課教師",
  currentRoles: "桌遊設計社指導老師\n國中小論文研究法指導教師\nAI／研究競賽指導教師\nSEL 教師社群課程領導人\nPBL 校本課程模組設計領導人",
  formerRoles: "臺中市西屯國小專任輔導教師\n臺中市車籠埔國小專任輔導教師\n永齡希望小學課輔教師",
  crossSchoolTeaching: "嘉義市北園國中｜AI 未來實驗室社團指導老師｜2026.09 起",
};

export function ProfileManager() {
  const [data, setData] = useState<Profile>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { void (async () => { const response = await websiteFetch("/api/admin/website/profile", { cache: "no-store" }); if (response.ok) { const row = await response.json() as Profile; setData({ ...initial, ...Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null && value !== "")) }); } setLoading(false); })(); }, []);
  async function upload(file: File, field: string) { const form = new FormData(); form.append("file", file); setMessage("檔案上傳中……"); const response = await websiteFetch("/api/admin/website/upload", { method: "POST", body: form }); const result = await response.json() as { url?: string; error?: string }; if (response.ok && result.url) { setData((current) => ({ ...current, [field]: result.url! })); setMessage("檔案已上傳，請記得儲存 Profile。"); } else setMessage(result.error || "上傳失敗"); }
  async function save() { setSaving(true); const response = await websiteFetch("/api/admin/website/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) }); setSaving(false); setMessage(response.ok ? "Profile 已儲存。未確認欄位可先留白，不會自動公開。" : "Profile 儲存失敗。"); }
  if (loading) return <section className="profile-manager"><p><Loader2 className="studio-spin" /> Profile 讀取中</p></section>;
  return <section className="profile-manager"><div className="content-manager-heading"><div><p className="overline">PROFILE CMS</p><h2>完整人物履歷</h2><p>集中維護人物、教學、研究、經歷與媒體資料。尚未確認的獎項、數字與資格請保留空白。</p></div><Button disabled={saving} onClick={() => void save()}>{saving ? <Loader2 className="studio-spin" /> : <Save />} 儲存 Profile</Button></div><div className="profile-groups">{groups.map((group) => <fieldset key={group.title}><legend>{group.title}</legend>{group.fields.map(([key, label]) => <label key={key}>{label}<Textarea value={String(data[key] || "")} onChange={(event) => setData({ ...data, [key]: event.target.value })} /></label>)}</fieldset>)}</div><fieldset className="profile-assets"><legend>照片與檔案</legend>{([ ["portraitImage", "正式個人形象照", "image/jpeg,image/png,image/webp"], ["speakerImage", "講師照片", "image/jpeg,image/png,image/webp"], ["teachingImage", "實際授課照", "image/jpeg,image/png,image/webp"], ["trainingImage", "教師分享／研習照", "image/jpeg,image/png,image/webp"], ["researchGuidanceImage", "指導學生研究照", "image/jpeg,image/png,image/webp"], ["pblImage", "PBL／課程活動照", "image/jpeg,image/png,image/webp"], ["selImage", "桌遊／SEL 實踐照", "image/jpeg,image/png,image/webp"], ["aiImage", "AI 課程／社團照", "image/jpeg,image/png,image/webp"], ["cvUrl", "CV／Speaker Kit", ".pdf,.doc,.docx"] ] as const).map(([key, label, accept]) => <div key={key}><label>{label}<Input value={String(data[key] || "")} onChange={(event) => setData({ ...data, [key]: event.target.value })} placeholder="上傳後會自動填入，或貼上網址" /></label><label className="studio-upload-button"><input type="file" accept={accept} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, key); event.target.value = ""; }} /><ImagePlus /> 上傳{label}</label></div>)}</fieldset>{message && <p className="studio-message">{message}</p>}</section>;
}
