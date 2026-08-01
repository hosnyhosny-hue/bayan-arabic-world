"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./pulse.module.css";
type Feed = { mode: string; posts: Array<Record<string, unknown>> };
const text = (v: unknown, f = "") => typeof v === "string" && v.trim() ? v : f;
export default function PulseClient(){
 const [feed,setFeed]=useState<Feed|null>(null);
 useEffect(()=>{let cancelled=false;(async()=>{let r=await fetch("/api/bayan-social/feed",{credentials:"include",cache:"no-store"});if(r.status===401||r.status===403)r=await fetch("/api/bayan-social/public-feed",{cache:"no-store"});const d=await r.json();if(!cancelled)setFeed({mode:d.mode||"guest",posts:d.posts||d.items||[]});})();return()=>{cancelled=true};},[]);
 return <main className={styles.page}><div className={styles.shell}><header className={styles.top}><Link href="/parents">← لوحة العائلة</Link><span className={styles.badge}>{feed?.mode==="guest"?"عرض عام":"عرض شخصي"}</span></header><section className={styles.hero}><h1>نبض بيان</h1><p>أخبار، قصص، إنجازات وفعاليات مجتمع بيان في تجربة قراءة كاملة.</p></section><section className={styles.feed}>{!feed?<div className={styles.empty}>جاري تحميل النبض…</div>:feed.posts.length?feed.posts.map((post,index)=><article className={styles.post} key={String(post.id||index)}><div className={styles.meta}>{text(post.authorName,"فريق بيان")} • {text(post.type,"تحديث")}</div><h2>{text(post.title,"تحديث جديد")}</h2><p>{text(post.content || post.body || post.caption,"تابع أحدث ما يحدث في مجتمع بيان.")}</p></article>):<div className={styles.empty}>لا توجد منشورات عامة بعد. انشر أول تحديث من لوحة BAYAN Social وسيظهر هنا تلقائيًا.</div>}</section></div></main>;
}
