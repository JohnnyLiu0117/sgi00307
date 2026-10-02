"use client";
import { websiteFetch } from "./request";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Save, Send, Trash2 } from "lucide-react";
import { Button } from "./ui";
import { Input } from "./ui";
import { Textarea } from "./ui";
import { articleLibrary, categories } from "./catalog";

type Post = {
  id: number; title: string; slug: string; category: string; excerpt: string; body: string;
  coverImage: string | null; readTime: string; status: "draft" | "published"; updatedAt: number;
};
type Draft = Omit<Post, "id" | "updatedAt"> & { id?: number };

const emptyDraft: Draft = { title: "", slug: "", category: categories[0].slug, excerpt: "", body: "", coverImage: null, readTime: "閱讀約 5 分鐘", status: "draft" };
const plannedArticles = articleLibrary.filter((article) => !article.published);

export function StudioEditor() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [uploading, setUploading] = useState<"cover" | "body" | null>(null);
  const [message, setMessage] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const busy = saving || removing || uploading !== null;

  const loadPosts = useCallback(async () => {
    const response = await websiteFetch("/api/admin/website/articles", { cache: "no-store" });
    if (!response.ok) { setMessage("無法讀取文章，請重新整理頁面。"); setLoading(false); return; }
    setPosts(await response.json());
    setLoading(false);
  }, []);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  async function upload(file: File, target: "cover" | "body") {
    setUploading(target); setMessage("");
    const data = new FormData(); data.append("file", file);
    const response = await websiteFetch("/api/admin/website/upload", { method: "POST", body: data });
    const result = await response.json() as { url?: string; error?: string };
    setUploading(null);
    if (!response.ok || !result.url) { setMessage(result.error || "圖片上傳失敗"); return; }
    if (target === "cover") setDraft((current) => ({ ...current, coverImage: result.url! }));
    else insertBodyImage(result.url, file.name.replace(/\.[^.]+$/, ""));
  }

  function insertBodyImage(url: string, alt = "文章內容照片") {
    const textarea = bodyRef.current;
    const start = textarea?.selectionStart ?? draft.body.length;
    const end = textarea?.selectionEnd ?? draft.body.length;
    const markup = `\n\n![${alt}](${url})\n\n`;
    setDraft((current) => ({ ...current, body: current.body.slice(0, start) + markup + current.body.slice(end) }));
    requestAnimationFrame(() => { textarea?.focus(); textarea?.setSelectionRange(start + markup.length, start + markup.length); });
  }

  async function save(status: "draft" | "published") {
    setSaving(true); setMessage("");
    const payload = { ...draft, status };
    const url = draft.id ? `/api/admin/website/articles/${draft.id}` : "/api/admin/website/articles";
    const response = await websiteFetch(url, { method: draft.id ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json() as Post & { error?: string };
    setSaving(false);
    if (!response.ok) { setMessage(result.error || "儲存失敗"); return; }
    setDraft({ ...result });
    setMessage(status === "published" ? "文章已發布，公開網站現在可以閱讀。" : "草稿已儲存。");
    await loadPosts();
  }

  async function remove() {
    if (!draft.id || !window.confirm(`確定刪除「${draft.title}」？這個動作無法復原。`)) return;
    setRemoving(true);
    try {
      const response = await websiteFetch(`/api/admin/website/articles/${draft.id}`, { method: "DELETE" });
      if (!response.ok) { setMessage("刪除失敗，請稍後再試。"); return; }
      setDraft(emptyDraft); setMessage("文章已刪除。"); await loadPosts();
    } finally { setRemoving(false); }
  }

  return <div className="studio-grid">
    <aside className="studio-list"><div className="studio-list-title"><h2>文章列表</h2><Button size="sm" disabled={busy} onClick={() => { setDraft(emptyDraft); setMessage(""); }}><Plus /> 新文章</Button></div>{loading ? <p className="studio-muted"><Loader2 className="studio-spin" /> 讀取中</p> : posts.length === 0 ? <p className="studio-muted">尚無自行新增的文章，可從下方內容庫開始。</p> : <div className="studio-posts">{posts.map((post) => <button key={post.id} disabled={busy} className={draft.id === post.id ? "active" : ""} onClick={() => { setDraft({ ...post }); setMessage(""); }}><span>{post.status === "published" ? "已發布" : "草稿"}</span><strong>{post.title}</strong><small>{new Date(post.updatedAt).toLocaleDateString("zh-TW")}</small></button>)}</div>}<div className="studio-library-title"><strong>後續內容庫</strong><span>{plannedArticles.length} 篇待發布</span></div><div className="studio-posts planned-posts">{plannedArticles.map((article) => <button key={article.slug} disabled={busy} onClick={() => { setDraft({ title: article.title, slug: article.slug, category: article.category, excerpt: article.excerpt, body: article.content.join("\n\n"), coverImage: article.coverImage, readTime: article.readTime, status: "draft" }); setMessage("已載入內容庫草稿，可修改後儲存或發布。"); }}><span>內容庫</span><strong>{article.title}</strong><small>{article.eyebrow}</small></button>)}</div></aside>
    <section className="studio-form">
      <div className="studio-form-top"><div><p className="overline">{draft.id ? "EDIT ARTICLE" : "NEW ARTICLE"}</p><h2>{draft.id ? "編輯文章" : "撰寫新文章"}</h2></div>{draft.id && <Button variant="destructive" size="sm" disabled={busy} onClick={() => void remove()}><Trash2 /> 刪除</Button>}</div>
      <fieldset className="studio-fields" disabled={busy} aria-busy={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}><label>文章標題<Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="輸入文章標題" /></label><div className="studio-two"><label>文章網址（英文）<Input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="例如 sel-in-classroom" /></label><label>文章分類<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{categories.map((category) => <option value={category.slug} key={category.slug}>{category.label}</option>)}</select></label></div><label>文章摘要<Textarea value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} placeholder="用一到兩句話說明文章重點" /></label><label>閱讀時間<Input value={draft.readTime} onChange={(event) => setDraft({ ...draft, readTime: event.target.value })} /></label>
        <div className="studio-cover-field"><div><strong>封面照片</strong><p>建議使用橫式照片，JPG、PNG 或 WebP，單張 4MB 以內。</p></div><label className="studio-upload-button"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, "cover"); event.target.value = ""; }} />{uploading === "cover" ? <Loader2 className="studio-spin" /> : <ImagePlus />} {draft.coverImage ? "更換封面" : "上傳封面"}</label>{draft.coverImage && <img src={draft.coverImage} alt="文章封面預覽" />}</div>
        <label className="studio-body-label"><span>文章內容</span><small>段落間請空一行；輸入「## 小標題」可建立段落標題。也可以直接把圖片貼進下方編輯區。</small><Textarea ref={bodyRef} className="studio-body-input" value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} onPaste={(event) => { const image = Array.from(event.clipboardData.files).find((file) => file.type.startsWith("image/")); if (image) { event.preventDefault(); void upload(image, "body"); } }} placeholder={"寫下文章內容……\n\n每一個段落之間空一行。"} /></label><label className="studio-upload-button inline-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, "body"); event.target.value = ""; }} />{uploading === "body" ? <Loader2 className="studio-spin" /> : <ImagePlus />} 插入內文照片</label>
      </fieldset>
      {message && <p className="studio-message" role="status">{message}</p>}
      <div className="studio-actions"><Button variant="outline" disabled={busy} onClick={() => void save("draft")}><Save /> 儲存草稿</Button><Button disabled={busy} onClick={() => void save("published")}>{saving ? <Loader2 className="studio-spin" /> : <Send />} 發布文章</Button></div>
    </section>
  </div>;
}
