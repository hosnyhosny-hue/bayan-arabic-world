"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./family-dashboard.module.css";

type Dashboard = { mode: string; viewer: { displayName?: string; role?: string }; summary: { updates: number; events: number; achievements: number }; pulse: Array<Record<string, unknown>>; };
const text = (v: unknown, f = "") => typeof v === "string" && v.trim() ? v : f;

export default function FamilyDashboardClient() {
  const [data, setData] = useState<Dashboard | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let viewer: Record<string, unknown> | null = null;
      try { const me = await fetch("/api/bayan-core/me", { credentials: "include", cache: "no-store" }); if (me.ok) viewer = await me.json(); } catch {}
      let response = await fetch(viewer ? "/api/bayan-family/dashboard" : "/api/bayan-family/public-dashboard", { credentials: "include", cache: "no-store" });
      if (response.status === 401 || response.status === 403) response = await fetch("/api/bayan-family/public-dashboard", { cache: "no-store" });
      const payload = await response.json();
      if (!cancelled) setData(payload);
    })();
    return () => { cancelled = true; };
  }, []);
  if (!data) return <main className={styles.page}><div className={styles.loading}>جاري تجهيز منزل العائلة الرقمي…</div></main>;
  const guest = data.mode === "guest"; const displayName = text(data.viewer?.displayName, guest ? "زائر بيان" : "أسرة بيان");
  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.topbar}><div className={styles.brand}><span className={styles.mark}>ب</span><span>BAYAN Family</span></div><nav className={styles.nav}><Link href="/parents">الرئيسية</Link><Link href="/parents/pulse">نبض بيان</Link><Link href="/events">الفعاليات</Link><Link href="/achievements">الإنجازات</Link></nav></header>
    <section className={styles.hero}><div className={styles.eyebrow}>{guest ? "الوضع العام • بدون تسجيل دخول" : "لوحة العائلة الشخصية"}</div><h1>أهلًا، {displayName}</h1><p>نافذتك اليومية إلى أخبار المدرسة، الإنجازات، الفعاليات، والقصص التي تصنع رحلة تعلم أبنائنا.</p><div className={styles.heroActions}><Link className={styles.primary} href="/parents/pulse">افتح نبض بيان</Link><Link className={styles.secondary} href="/achievements">استكشف الإنجازات</Link></div></section>
    <section className={styles.stats}><article className={styles.stat}><strong>{data.summary?.updates ?? 0}</strong><span>تحديثات حديثة</span></article><article className={styles.stat}><strong>{data.summary?.events ?? 0}</strong><span>فعاليات</span></article><article className={styles.stat}><strong>{data.summary?.achievements ?? 0}</strong><span>إنجازات</span></article></section>
    <section className={styles.grid}><article className={styles.panel}><div className={styles.panelHeader}><h2>نبض بيان</h2><Link href="/parents/pulse">عرض الكل</Link></div><div className={styles.feed}>{data.pulse?.length ? data.pulse.slice(0,5).map((post,index)=><article className={styles.post} key={String(post.id||index)}><div className={styles.meta}>{text(post.authorName,"فريق بيان")} • {text(post.type,"تحديث")}</div><h3>{text(post.title,"تحديث جديد من مجتمع بيان")}</h3><p>{text(post.content || post.body || post.caption,"تابع أحدث الأخبار والفعاليات والإنجازات من مجتمع المدرسة.")}</p></article>) : <div className={styles.empty}>ستظهر هنا المنشورات العامة فور نشرها من لوحة BAYAN Social.</div>}</div></article>
    <aside className={styles.sideStack}><section className={styles.panel}><div className={styles.panelHeader}><h2>وصول سريع</h2></div><div className={styles.quick}><Link href="/news">الأخبار</Link><Link href="/events">الفعاليات</Link><Link href="/media-gallery">المعرض</Link><Link href="/resources">المصادر</Link></div></section>{guest && <section className={styles.notice}>أنت تتصفح النسخة العامة الآمنة. بيانات الأبناء والرسائل والتقارير الخاصة لا تُعرض دون جلسة ولي أمر.</section>}</aside></section>
  </div></main>;
}
