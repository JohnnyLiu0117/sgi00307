"use client";
import { websiteFetch } from "./request";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "./ui";
import { Button } from "./ui";
import { Input } from "./ui";
import { Textarea } from "./ui";

type Item = {
  id: number; collection: string; slug: string; title: string; subtitle: string | null; summary: string | null;
  date: string | null; organization: string | null; image: string | null; link: string | null; quote: string | null;
  topic: string | null; activityType: string | null; location: string | null; feedback: string | null; featured: number;
  consentConfirmed: number; displayName: string | null; anonymous: number; source: string | null; status: "draft" | "published";
};
type Draft = Omit<Item, "id" | "featured" | "consentConfirmed" | "anonymous"> & { id?: number; featured: boolean; consentConfirmed: boolean; anonymous: boolean };

const collections = [
  { value: "cases", label: "教育案例" }, { value: "speaking_topics", label: "演講主題" },
  { value: "speaking_records", label: "合作紀錄" }, { value: "testimonials", label: "推薦回饋" }, { value: "resources", label: "講師素材" },
];
const blank = (collection: string): Draft => ({ collection, slug: "", title: "", subtitle: null, summary: null, date: null, organization: null, image: null, link: null, quote: null, topic: null, activityType: null, location: null, feedback: null, featured: false, consentConfirmed: false, displayName: null, anonymous: true, source: null, status: "draft" });
const toDraft = (item: Item): Draft => ({ ...item, featured: item.featured === 1, consentConfirmed: item.consentConfirmed === 1, anonymous: item.anonymous !== 0 });

export function ContentManager() {
  const [collection, setCollection] = useState("cases");
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Draft>(blank("cases"));
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const listRequest = useRef(0); const currentCollection = useRef("cases");
  const load = useCallback(async (selected: string) => {
    if (selected !== currentCollection.current) return;
    const request = ++listRequest.current;
    setLoading(true);
    const response = await websiteFetch(`/api/admin/website/content?collection=${selected}`, { cache: "no-store" });
    if (request !== listRequest.current) return;
    const rows = response.ok ? await response.json() : [];
    if (request !== listRequest.current) return;
    setItems(rows); setLoading(false);
  }, []);
  useEffect(() => { void load(collection); return () => { listRequest.current += 1; }; }, [collection, load]);
  function changeCollection(value: string) {
    if (busy) return;
    if (value !== currentCollection.current) { currentCollection.current = value; listRequest.current += 1; setLoading(true); }
    setCollection(value); setDraft(blank(value)); setMessage("");
  }
  async function upload(file: File) {
    if (busy) return;
    setBusy(true); setMessage("圖片上傳中……");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await websiteFetch("/api/admin/website/upload", { method: "POST", body: form });
      const result = await response.json() as { url?: string; error?: string };
      if (response.ok && result.url) { setDraft((current) => ({ ...current, image: result.url! })); setMessage("圖片已上傳。"); }
      else setMessage(result.error || "圖片上傳失敗");
    } catch { setMessage("圖片上傳失敗，請稍後再試。"); }
    finally { setBusy(false); }
  }
  async function save(status: "draft" | "published") {
    if (busy) return;
    if (collection === "testimonials" && status === "published" && !draft.consentConfirmed) { setMessage("推薦回饋必須先確認公開同意，才能發布。"); return; }
    setBusy(true); setSaving(true);
    try {
      const response = await websiteFetch(draft.id ? `/api/admin/website/content/${draft.id}` : "/api/admin/website/content", { method: draft.id ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...draft, collection, status }) });
      const result = await response.json() as Item & { error?: string };
      if (!response.ok) { setMessage(result.error || "儲存失敗"); return; }
      setDraft(toDraft(result)); setMessage(status === "published" ? "內容已發布到前台對應區塊。" : "草稿已儲存。"); await load(collection);
    } catch { setMessage("儲存失敗，請稍後再試。"); }
    finally { setBusy(false); setSaving(false); }
  }
  async function remove() {
    if (busy || !draft.id || !window.confirm(`確定刪除「${draft.title}」？`)) return;
    setBusy(true);
    try {
      const response = await websiteFetch(`/api/admin/website/content/${draft.id}`, { method: "DELETE" });
      if (!response.ok) { const result = await response.json() as { error?: string }; setMessage(result.error || "刪除未完成，原資料仍保留。"); return; }
      setDraft(blank(collection)); setMessage("內容已刪除。"); await load(collection);
    } catch { setMessage("刪除未完成，請稍後再試。"); }
    finally { setBusy(false); }
  }
  return <section className="content-manager"><fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}><div className="content-manager-heading"><div><p className="overline">SITE CONTENT CMS</p><h2>網站內容管理</h2><p>合作紀錄可完整管理活動資訊；推薦回饋只有確認同意後才能公開。</p></div><Button onClick={() => setDraft(blank(collection))}><Plus /> 新增內容</Button></div>
    <Tabs value={collection} onValueChange={changeCollection}><TabsList className="content-tabs">{collections.map((item) => <TabsTrigger value={item.value} key={item.value}>{item.label}</TabsTrigger>)}</TabsList></Tabs>
    <div className="content-manager-grid"><aside>{loading ? <p><Loader2 className="studio-spin" /> 讀取中</p> : items.length === 0 ? <p>這個集合目前沒有自行新增的內容。</p> : items.map((item) => <button className={draft.id === item.id ? "active" : ""} key={item.id} onClick={() => setDraft(toDraft(item))}><span>{item.status === "published" ? "已發布" : "草稿"}</span><strong>{item.title}</strong><small>{item.organization || item.date || item.slug}</small></button>)}</aside>
      <div className="content-form"><div className="studio-two"><label>活動／內容名稱<Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><label>英文代稱<Input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="example-record" /></label></div>
        <label>{collection === "speaking_records" ? "分享主題" : "副標題"}<Input value={collection === "speaking_records" ? draft.topic || "" : draft.subtitle || ""} onChange={(event) => collection === "speaking_records" ? setDraft({ ...draft, topic: event.target.value }) : setDraft({ ...draft, subtitle: event.target.value })} /></label>
        <label>100 字摘要<Textarea value={draft.summary || ""} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
        <div className="studio-two"><label>日期<Input type="date" value={draft.date || ""} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></label><label>主辦／合作單位<Input value={draft.organization || ""} onChange={(event) => setDraft({ ...draft, organization: event.target.value })} /></label></div>
        {collection === "speaking_records" && <><div className="studio-two"><label>活動類型<Input value={draft.activityType || ""} onChange={(event) => setDraft({ ...draft, activityType: event.target.value })} placeholder="教師研習／工作坊／共備" /></label><label>分享地點<Input value={draft.location || ""} onChange={(event) => setDraft({ ...draft, location: event.target.value })} /></label></div><label>活動回饋（有真實資料才填）<Textarea value={draft.feedback || ""} onChange={(event) => setDraft({ ...draft, feedback: event.target.value })} /></label><label className="studio-check"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> 首頁精選</label></>}
        {collection === "testimonials" && <><label>實際回饋文字<Textarea value={draft.quote || ""} onChange={(event) => setDraft({ ...draft, quote: event.target.value })} /></label><div className="studio-two"><label>顯示姓名／角色<Input value={draft.displayName || ""} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></label><label>回饋來源<Input value={draft.source || ""} onChange={(event) => setDraft({ ...draft, source: event.target.value })} placeholder="研習回饋表／Email" /></label></div><div className="studio-check-row"><label className="studio-check"><input type="checkbox" checked={draft.anonymous} onChange={(event) => setDraft({ ...draft, anonymous: event.target.checked })} /> 匿名顯示</label><label className="studio-check"><input type="checkbox" checked={draft.consentConfirmed} onChange={(event) => setDraft({ ...draft, consentConfirmed: event.target.checked })} /> Consent confirmed</label></div></>}
        <label>外部網址<Input value={draft.link || ""} onChange={(event) => setDraft({ ...draft, link: event.target.value })} placeholder="https://..." /></label>
        <div className="content-image-row"><label className="studio-upload-button"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} /><ImagePlus /> 上傳實際照片</label>{draft.image && <img src={draft.image} alt="內容圖片預覽" />}</div>
        {message && <p className="studio-message">{message}</p>}<div className="content-actions">{draft.id && <Button variant="destructive" onClick={() => void remove()}><Trash2 /> 刪除</Button>}<Button variant="outline" disabled={saving} onClick={() => void save("draft")}><Save /> 儲存草稿</Button><Button disabled={saving} onClick={() => void save("published")}>{saving && <Loader2 className="studio-spin" />} 發布</Button></div></div>
    </div></fieldset></section>;
}
