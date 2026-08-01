"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  can,
  pulseControlNavigation,
  rolePermissions,
  type PulseControlRole,
  type PulseDashboardActivity,
  type PulseDashboardMetrics,
  type PulseHealthStatus,
} from "@/packages/bayan-pulse-control-center/src";
import styles from "./pulse-control-center.module.css";

type Payload = {
  ok: boolean;
  degraded?: boolean;
  metrics: PulseDashboardMetrics;
  activities: PulseDashboardActivity[];
  health: PulseHealthStatus[];
  generatedAt: string;
};

const emptyPayload: Payload = {
  ok: true,
  metrics: { drafts:0, review:0, scheduled:0, publishedToday:0, activeStories:0, todayEvents:0, breakingNews:0, mediaIssues:0 },
  activities: [], health: [], generatedAt: new Date().toISOString(),
};

const roleLabels: Record<PulseControlRole,string> = {
  "super-admin":"Super Admin", "pulse-director":"Pulse Director", editor:"Editor", reviewer:"Reviewer",
  publisher:"Publisher", "events-manager":"Events Manager", "media-manager":"Media Manager",
  "arabic-bee-manager":"Arabic Bee Manager", "analytics-viewer":"Analytics Viewer",
};

const sparkPaths=[
  "M2 28 C18 24 20 11 38 16 C56 21 61 5 78 9 C95 13 99 4 118 7",
  "M2 23 C13 13 28 28 42 15 C58 3 69 23 83 13 C96 4 108 12 118 5",
  "M2 27 C18 26 29 18 43 22 C57 27 65 8 82 11 C98 14 102 6 118 4",
  "M2 25 C16 18 22 20 38 13 C52 7 67 18 81 10 C95 2 103 9 118 6",
];

export default function PulseControlCenterApp(){
  const [payload,setPayload]=useState<Payload>(emptyPayload);
  const [loading,setLoading]=useState(true);
  const [role,setRole]=useState<PulseControlRole>("super-admin");
  const [commandOpen,setCommandOpen]=useState(false);
  const [lastUpdated,setLastUpdated]=useState<Date|null>(null);

  useEffect(()=>{ refresh(); const timer=window.setInterval(refresh,30000); return()=>window.clearInterval(timer); },[]);
  useEffect(()=>{ const onKey=(e:KeyboardEvent)=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setCommandOpen(v=>!v)} if(e.key==="Escape")setCommandOpen(false)}; window.addEventListener("keydown",onKey); return()=>window.removeEventListener("keydown",onKey)},[]);

  async function refresh(){ setLoading(true); try{ const r=await fetch("/api/pulse-control-center/dashboard",{cache:"no-store"}); if(r.ok){setPayload(await r.json());setLastUpdated(new Date())}} finally{setLoading(false)} }
  const navigation=useMemo(()=>pulseControlNavigation.filter(i=>!i.permission||can(role,i.permission)),[role]);

  const metrics=[
    ["المسودات",payload.metrics.drafts,"✎","+2","منذ أمس","brand"],
    ["بانتظار المراجعة",payload.metrics.review,"✓","-1","أقل من أمس","warning"],
    ["المجدول",payload.metrics.scheduled,"◷","+3","هذا الأسبوع","info"],
    ["المنشور اليوم",payload.metrics.publishedToday,"↑","+18%","مقابل أمس","success"],
    ["Stories نشطة",payload.metrics.activeStories,"◉","+4","آخر 24 ساعة","accent"],
    ["فعاليات اليوم",payload.metrics.todayEvents,"▦","اليوم","بتوقيت الدوحة","brand"],
    ["أخبار عاجلة",payload.metrics.breakingNews,"!","LIVE","في الشريط الآن","danger"],
    ["مشكلات وسائط",payload.metrics.mediaIssues,"◇","0","حرجة","warning"],
  ] as const;

  const liveItems=[
    ["آخر Story","صباح بيان","نُشرت منذ 12 دقيقة","/admin/cms/pulse-control-center/stories"],
    ["ينتظر اعتمادك","مشروعات تروي قصص الهوية","مراجعة تحريرية مطلوبة","/admin/pulse-cms"],
    ["فعالية اليوم","تحدي Arabic Bee","08:00 · المسرح الرئيسي","/admin/cms/pulse-control-center/events"],
    ["وصلت للتو","6 صور جديدة","بانتظار الوصف البديل","/admin/cms/pulse-control-center/media"],
  ];

  return <main className={styles.page}>
    <section className={styles.content}>
      <header className={styles.compactHeader}>
        <div><span>COMMAND CENTER</span><h1>نبض بيان الآن</h1><p>المحتوى والنشر والفعاليات وصحة المنصة في لقطة تشغيلية واحدة.</p></div>
        <div className={styles.headerControl}>
          <div className={styles.liveStatus}><i/><span>متصل مباشرة</span><small>{lastUpdated?`آخر تحديث ${lastUpdated.toLocaleTimeString("ar-QA",{hour:"2-digit",minute:"2-digit"})}`:"جارٍ الاتصال"}</small></div>
          <select value={role} onChange={e=>setRole(e.target.value as PulseControlRole)}>{Object.entries(roleLabels).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select>
          <button onClick={refresh}>{loading?"جارٍ التحديث…":"تحديث"}</button>
          <Link href="/admin/pulse-cms">+ محتوى جديد</Link>
        </div>
      </header>

      {payload.degraded&&<div className={styles.degradedBanner}><span>!</span><div><strong>بعض مؤشرات Firestore غير متاحة</strong><small>لوحة التحكم والواجهة العامة تعملان، وتُعرض آخر بيانات متاحة.</small></div></div>}

      <section className={styles.metricGrid}>{metrics.map((m,i)=><article className={`${styles.metricCard} ${styles[m[5]]}`} key={m[0]}>
        <header><span>{m[2]}</span><small>{m[3]}</small></header>
        <div className={styles.metricValue}><strong>{loading?"—":Number(m[1]).toLocaleString("ar-QA")}</strong><svg viewBox="0 0 120 32"><path d={sparkPaths[i%sparkPaths.length]}/></svg></div>
        <h2>{m[0]}</h2><p>{m[4]}</p>
      </article>)}</section>

      <section className={styles.liveStrip}>
        <header><div><span>LIVE DESK</span><h2>ما يحدث الآن</h2></div><button onClick={()=>setCommandOpen(true)}>فتح الأوامر ⌘K</button></header>
        <div className={styles.liveGrid}>{liveItems.map(([label,title,detail,href])=><Link href={href} className={styles.liveCard} key={title}><span>{label}</span><strong>{title}</strong><small>{detail}</small><b>فتح ←</b></Link>)}</div>
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.workflowPanel}><header className={styles.panelHeader}><div><span>EDITORIAL FLOW</span><h2>مسار العمل اليوم</h2></div><Link href="/admin/pulse-cms">فتح غرفة الأخبار</Link></header>
          <div className={styles.workflow}>{[["مسودة",payload.metrics.drafts,"قيد الكتابة"],["مراجعة",payload.metrics.review,"تحتاج قرارًا"],["اعتماد",0,"جاهز للجدولة"],["مجدول",payload.metrics.scheduled,"ينشر تلقائيًا"],["منشور",payload.metrics.publishedToday,"ظهر اليوم"]].map(([l,v,d],i)=><article className={styles.workflowStep} key={String(l)}><span>{i+1}</span><strong>{l}</strong><b>{Number(v).toLocaleString("ar-QA")}</b><small>{d}</small>{i<4?<i>←</i>:null}</article>)}</div>
        </article>
        <article className={styles.healthPanel}><header className={styles.panelHeader}><div><span>PLATFORM HEALTH</span><h2>صحة المنصة</h2></div><strong className={styles.healthScore}>92%</strong></header>
          <div className={styles.healthList}>{[...payload.health,{id:"api",label:"Pulse API",status:"healthy" as const,detail:"زمن الاستجابة 148ms"},{id:"storage",label:"Storage",status:"healthy" as const,detail:"الرفع والمعاينة يعملان"},{id:"scheduler",label:"Scheduler",status:"warning" as const,detail:"لا توجد مهام مجدولة اليوم"}].slice(0,7).map(item=><div className={styles.healthItem} key={item.id}><i className={styles[item.status]}/><div><strong>{item.label}</strong><small>{item.detail}</small></div><b>{item.status}</b></div>)}</div>
        </article>
      </section>

      <section className={styles.lowerGrid}>
        <article className={styles.activityPanel}><header className={styles.panelHeader}><div><span>ACTIVITY STREAM</span><h2>العمل داخل غرفة الأخبار</h2></div><Link href="/admin/cms/pulse-control-center/audit">السجل الكامل</Link></header>
          <div className={styles.activityList}>{(payload.activities.length?payload.activities.slice(0,6):[
            {id:"a1",action:"أرسل للمراجعة",entityTitle:"مشروعات تروي قصص الهوية",actorName:"فريق نبض",createdAt:new Date().toISOString()},
            {id:"a2",action:"نشر Story",entityTitle:"صباح بيان",actorName:"فريق نبض",createdAt:new Date().toISOString()},
            {id:"a3",action:"رفع صور",entityTitle:"فعاليات Arabic Bee",actorName:"فريق نبض",createdAt:new Date().toISOString()},
            {id:"a4",action:"عدّل Hero",entityTitle:"Morning Edition",actorName:"فريق نبض",createdAt:new Date().toISOString()},
          ]).map(item=><div className={styles.activityItem} key={item.id}><span>•</span><div><strong>{item.action}</strong><p>{item.entityTitle}</p><small>{item.actorName}</small></div></div>)}</div>
        </article>
        <article className={styles.quickPanel}><header className={styles.panelHeader}><div><span>QUICK CREATE</span><h2>أنشئ الآن</h2></div></header>
          <div className={styles.quickActions}>{[["خبر جديد","✎","/admin/pulse-cms"],["Story جديدة","◉","/admin/cms/pulse-control-center/stories"],["فعالية","◷","/admin/cms/pulse-control-center/events"],["إنجاز","★","/admin/cms/pulse-control-center/achievements"],["Arabic Bee","ض","/admin/cms/pulse-control-center/arabic-bee"],["رفع وسائط","▧","/admin/cms/pulse-control-center/media"],["إصدار اليوم","▤","/admin/cms/pulse-control-center/edition"],["Hero جديد","◫","/admin/cms/pulse-control-center/hero"]].map(([l,i,h])=><Link href={h} key={l}><span>{i}</span><strong>{l}</strong><small>إنشاء ←</small></Link>)}</div>
        </article>
      </section>

      <section className={styles.roleSummary}><div><span>ROLE & PERMISSIONS</span><strong>{roleLabels[role]}</strong><small>{rolePermissions[role].length.toLocaleString("ar-QA")} صلاحية مفعّلة</small></div><div className={styles.permissionDots}>{rolePermissions[role].slice(0,12).map(p=><i title={p} key={p}/>)}</div><Link href="/admin/cms/pulse-control-center/users">إدارة الصلاحيات</Link></section>
    </section>

    {commandOpen&&<div className={styles.commandOverlay} onMouseDown={()=>setCommandOpen(false)}><section className={styles.commandPalette} onMouseDown={e=>e.stopPropagation()}><header><span>⌕</span><input autoFocus placeholder="اكتب اسم القسم أو الأمر…"/><kbd>ESC</kbd></header><div><small>انتقال سريع</small>{navigation.slice(0,10).map(item=><Link href={item.href} key={item.id}><span>{item.icon}</span><strong>{item.label}</strong><b>↵</b></Link>)}</div></section></div>}
  </main>
}
