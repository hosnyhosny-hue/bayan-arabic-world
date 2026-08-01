"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProgressiveImage from "./ProgressiveImage";
import { EmptyState, ErrorState } from "./ExperienceState";
import styles from "../pulse-polish.module.css";

type PulseItem = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  channel?: string;
};

const fallbackItems: PulseItem[] = [
  { id:"fallback-1", title:"صوت الطلاب يملأ اليوم بالحياة", excerpt:"لقطات من أنشطة اللغة العربية ومشروعات الطلاب داخل المدرسة.", image:"/images/bayan/pulse-feed-1.jpg", category:"داخل الصف", channel:"arabic" },
  { id:"fallback-2", title:"الاستعدادات النهائية لـ Arabic Bee", excerpt:"فرق الطلاب تستعد للجولة القادمة من المسابقة.", image:"/images/bayan/pulse-feed-2.jpg", category:"Arabic Bee", channel:"arabic-bee" },
  { id:"fallback-3", title:"مشروعات تروي قصص الهوية", excerpt:"أعمال طلابية تجمع البحث والإبداع واللغة.", image:"/images/bayan/pulse-feed-3.jpg", category:"إنجازات", channel:"achievements" },
];

export default function InfinitePulseFeed() {
  const [items,setItems]=useState<PulseItem[]>(fallbackItems);
  const [cursor,setCursor]=useState<string|null>("initial");
  const [channel,setChannel]=useState("all");
  const [loading,setLoading]=useState(false);
  const [failed,setFailed]=useState(false);
  const sentinel=useRef<HTMLDivElement|null>(null);

  const loadMore=useCallback(async(reset=false)=>{
    if(loading||(!cursor&&!reset))return;
    setLoading(true);
    setFailed(false);
    try{
      const activeCursor=reset?"initial":cursor;
      const response=await fetch(
        `/api/pulse/feed?cursor=${encodeURIComponent(activeCursor||"initial")}&limit=6&channel=${encodeURIComponent(channel)}`,
        {cache:"no-store"}
      );
      if(!response.ok)throw new Error("feed");
      const payload=await response.json();
      const next=Array.isArray(payload.items)?payload.items:[];
      setItems((current)=>reset?next:[...current,...next.filter((item:PulseItem)=>!current.some((existing)=>existing.id===item.id))]);
      setCursor(payload.nextCursor||null);
    }catch{
      setFailed(true);
      setCursor(null);
    }finally{
      setLoading(false);
    }
  },[channel,cursor,loading]);

  useEffect(()=>{
    const handler=(event:Event)=>{
      const value=(event as CustomEvent<string>).detail||"all";
      setChannel(value);
      setCursor("initial");
    };
    window.addEventListener("bayan-channel-change",handler);
    return()=>window.removeEventListener("bayan-channel-change",handler);
  },[]);

  useEffect(()=>{
    loadMore(true);
  },[channel]);

  useEffect(()=>{
    const element=sentinel.current;
    if(!element)return;
    const observer=new IntersectionObserver(
      (entries)=>{if(entries[0]?.isIntersecting)loadMore(false)},
      {rootMargin:"500px 0px"}
    );
    observer.observe(element);
    return()=>observer.disconnect();
  },[loadMore]);

  if(!items.length&&!loading&&!failed){
    return <EmptyState title="لا يوجد محتوى في هذه القناة" description="سنضيف المحتوى الجديد هنا فور نشره."/>;
  }

  return (
    <div className={styles.feedWrap}>
      <div className={styles.feedGrid}>
        {items.map((item,index)=>(
          <article className={`${styles.feedCard} ${index%5===0?styles.feedCardWide:""}`} key={item.id}>
            <ProgressiveImage src={item.image} alt={item.title} className={styles.feedImage}/>
            <div className={styles.feedOverlay}/>
            <div className={styles.feedContent}>
              <span>{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
      {loading&&<div className={styles.feedLoading}><i/><i/><i/></div>}
      {failed&&<ErrorState title="تعذر تحميل المزيد" description="المحتوى الحالي ما زال متاحًا."/>}
      <div ref={sentinel} className={styles.sentinel}/>
    </div>
  );
}
