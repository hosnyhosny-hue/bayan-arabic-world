"use client";

import { useCallback, useEffect, useState } from "react";
import type { BayanSocialPost } from "../types";

const shell: React.CSSProperties = { minHeight: "100vh", background: "#f4f7f5", color: "#10231b", direction: "rtl", padding: "32px 16px 64px" };
const card: React.CSSProperties = { background: "white", border: "1px solid #e1e8e4", borderRadius: 24, padding: 22, boxShadow: "0 12px 34px rgba(16,35,27,.06)" };

export function BayanSocialFeed() {
  const [posts, setPosts] = useState<BayanSocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/bayan-social/feed", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "تعذر تحميل نبض بيان");
      setPosts(payload.data.items || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذر التحميل"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function react(postId: string, reaction: string) {
    await fetch("/api/bayan-social/reactions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ postId, reaction }) });
    await load();
  }

  return <main style={shell}>
    <section style={{ maxWidth: 760, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <div style={{ color: "#087852", fontWeight: 800, letterSpacing: 1 }}>BAYAN SOCIAL</div>
        <h1 style={{ fontSize: "clamp(34px,6vw,62px)", margin: "8px 0" }}>نبض بيان</h1>
        <p style={{ color: "#64716b", margin: 0 }}>مجتمع المدرسة، الإنجازات، القصص، واللحظات التي تستحق أن تُروى.</p>
      </header>
      {loading && <div style={card}>جارٍ تحميل النبض...</div>}
      {error && <div style={{ ...card, borderColor: "#efb6b6" }}>{error}</div>}
      {!loading && !error && posts.length === 0 && <div style={card}>لا توجد منشورات منشورة بعد.</div>}
      <div style={{ display: "grid", gap: 18 }}>
        {posts.map((post) => <article key={post.id} style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div><strong>{post.author.displayName}</strong><div style={{ fontSize: 12, color: "#7a8781" }}>{new Date(post.createdAt).toLocaleString("ar-QA")}</div></div>
            <span style={{ background: "#edf8f3", color: "#087852", padding: "6px 10px", borderRadius: 999, fontSize: 12 }}>{post.type}</span>
          </div>
          {(post.titleAr || post.titleEn) && <h2 style={{ margin: "18px 0 8px", fontSize: 24 }}>{post.titleAr || post.titleEn}</h2>}
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.9, margin: "12px 0" }}>{post.bodyAr}</p>
          {post.media.length > 0 && <div style={{ display: "grid", gap: 10, gridTemplateColumns: post.media.length > 1 ? "repeat(2,minmax(0,1fr))" : "1fr" }}>
            {post.media.map((item) => item.mimeType.startsWith("video/")
              ? <video key={item.id} src={item.url} controls style={{ width: "100%", borderRadius: 16 }} />
              : <img key={item.id} src={item.url} alt={item.altAr || item.name || "BAYAN media"} style={{ width: "100%", borderRadius: 16, objectFit: "cover", maxHeight: 520 }} />)}
          </div>}
          <footer style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
            {[["like","إعجاب"],["celebrate","نحتفل"],["love","أحببته"],["insightful","ملهم"]].map(([value,label]) => <button key={value} onClick={() => void react(post.id, value)} style={{ border: "1px solid #dfe7e2", background: "white", borderRadius: 999, padding: "8px 13px", cursor: "pointer" }}>{label} {post.reactionCounts[value as keyof typeof post.reactionCounts] || 0}</button>)}
            <span style={{ marginInlineStart: "auto", padding: "8px 0", color: "#6f7b75" }}>التعليقات {post.commentsCount}</span>
          </footer>
        </article>)}
      </div>
    </section>
  </main>;
}
