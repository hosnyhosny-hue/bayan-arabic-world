"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { BayanSocialPost } from "../types";

const field: React.CSSProperties = { width: "100%", border: "1px solid #dce5df", borderRadius: 14, padding: "12px 14px", font: "inherit", boxSizing: "border-box" };
const button: React.CSSProperties = { border: 0, borderRadius: 14, padding: "12px 18px", fontWeight: 800, cursor: "pointer" };

export function BayanSocialAdmin() {
  const [posts, setPosts] = useState<BayanSocialPost[]>([]);
  const [message, setMessage] = useState("");
  const [bodyAr, setBodyAr] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const load = useCallback(async () => {
    const r = await fetch("/api/bayan-social/feed?includePending=1", { cache: "no-store" });
    const p = await r.json(); if (r.ok) setPosts(p.data.items || []);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage("جارٍ الحفظ...");
    const r = await fetch("/api/bayan-social/posts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "announcement", visibility: "school", titleAr, bodyAr, media: [], tags: [], submitForReview: false }) });
    const p = await r.json(); setMessage(r.ok ? "تم نشر المحتوى بنجاح" : p.error || "تعذر النشر");
    if (r.ok) { setBodyAr(""); setTitleAr(""); await load(); }
  }

  async function moderate(entityId: string, action: "approve"|"reject"|"archive") {
    await fetch("/api/bayan-social/moderation", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entityType: "post", entityId, action }) });
    await load();
  }

  return <main dir="rtl" style={{ minHeight: "100vh", background: "#f3f6f4", padding: 24, color: "#10231b" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}><div style={{ color: "#087852", fontWeight: 900 }}>BAYAN SOCIAL ADMIN</div><h1 style={{ fontSize: 42, margin: "6px 0" }}>إدارة نبض بيان</h1></div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.35fr)", gap: 18, alignItems: "start" }}>
        <form onSubmit={submit} style={{ background: "white", padding: 22, borderRadius: 22, border: "1px solid #e0e7e3" }}>
          <h2 style={{ marginTop: 0 }}>منشور جديد</h2>
          <input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="عنوان المنشور" style={field} />
          <textarea value={bodyAr} onChange={(e) => setBodyAr(e.target.value)} placeholder="اكتب قصة، خبرًا أو إنجازًا..." required rows={8} style={{ ...field, marginTop: 12, resize: "vertical" }} />
          <button style={{ ...button, width: "100%", marginTop: 12, background: "#f68b1f", color: "white" }}>نشر الآن</button>
          {message && <p>{message}</p>}
        </form>
        <section style={{ display: "grid", gap: 12 }}>
          {posts.map((post) => <article key={post.id} style={{ background: "white", padding: 18, borderRadius: 18, border: "1px solid #e0e7e3" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><strong>{post.titleAr || "منشور بلا عنوان"}</strong><span>{post.status}</span></div>
            <p style={{ color: "#526059", lineHeight: 1.7 }}>{post.bodyAr.slice(0, 220)}</p>
            <div style={{ display: "flex", gap: 8 }}>
              {post.status !== "published" && <button onClick={() => void moderate(post.id,"approve")} style={{ ...button, background: "#087852", color: "white" }}>اعتماد</button>}
              <button onClick={() => void moderate(post.id,"reject")} style={{ ...button, background: "#fff0f0", color: "#9f2222" }}>رفض</button>
              <button onClick={() => void moderate(post.id,"archive")} style={{ ...button, background: "#eef1ef" }}>أرشفة</button>
            </div>
          </article>)}
        </section>
      </div>
    </div>
  </main>;
}
