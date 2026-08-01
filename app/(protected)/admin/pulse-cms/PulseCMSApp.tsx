"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./pulse-cms.module.css";
import type {
  PulseChannel,
  PulseContentDocument,
  PulseContentType,
  PulseHeroDocument,
  PulseLocale,
  PulseStatus,
} from "@/packages/bayan-pulse-cms/src";

const contentTypes: Array<{ value: PulseContentType; label: string }> = [
  { value: "news", label: "خبر" },
  { value: "story", label: "Story" },
  { value: "event", label: "فعالية" },
  { value: "achievement", label: "إنجاز" },
  { value: "video", label: "فيديو" },
  { value: "quote", label: "اقتباس" },
  { value: "gallery", label: "معرض صور" },
  { value: "arabic-bee", label: "Arabic Bee" },
  { value: "community", label: "المجتمع" },
];

const channels: Array<{ value: PulseChannel; label: string }> = [
  { value: "school-news", label: "أخبار المدرسة" },
  { value: "arabic", label: "اللغة العربية" },
  { value: "events", label: "الفعاليات" },
  { value: "achievements", label: "الإنجازات" },
  { value: "arabic-bee", label: "Arabic Bee" },
  { value: "video", label: "الفيديو" },
  { value: "community", label: "المجتمع" },
];

const emptyContent: PulseContentDocument = {
  id: "",
  locale: "ar",
  type: "news",
  channel: "school-news",
  status: "draft",
  title: "",
  excerpt: "",
  body: "",
  authorName: "",
  coverUrl: "",
  tags: [],
  isFeatured: false,
  isBreaking: false,
  isLive: false,
};

type Metrics = {
  drafts: number;
  review: number;
  scheduled: number;
  published: number;
  stories: number;
  events: number;
  achievements: number;
  videos: number;
};

export default function PulseCMSApp() {
  const [tab, setTab] = useState("dashboard");
  const [locale, setLocale] = useState<PulseLocale>("ar");
  const [items, setItems] = useState<PulseContentDocument[]>([]);
  const [editing, setEditing] = useState<PulseContentDocument>(emptyContent);
  const [metrics, setMetrics] = useState<Metrics>({
    drafts: 0, review: 0, scheduled: 0, published: 0,
    stories: 0, events: 0, achievements: 0, videos: 0,
  });
  const [heroes, setHeroes] = useState<PulseHeroDocument[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    refreshAll();
  }, [locale]);

  async function refreshAll() {
    const [contentResponse, dashboardResponse, heroResponse] = await Promise.all([
      fetch(`/api/pulse-cms/content?locale=${locale}&limit=100`, { cache: "no-store" }),
      fetch("/api/pulse-cms/dashboard", { cache: "no-store" }),
      fetch(`/api/pulse-cms/heroes?locale=${locale}`, { cache: "no-store" }),
    ]);

    if (contentResponse.ok) setItems((await contentResponse.json()).items || []);
    if (dashboardResponse.ok) setMetrics((await dashboardResponse.json()).metrics || metrics);
    if (heroResponse.ok) setHeroes((await heroResponse.json()).items || []);
  }

  async function saveContent(status?: PulseStatus) {
    const payload = { ...editing, locale, status: status || editing.status };
    const response = await fetch("/api/pulse-cms/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      setMessage(payload.status === "published" ? "تم النشر" : "تم الحفظ");
      setEditing({ ...emptyContent, locale });
      await refreshAll();
      setTab("content");
    }
  }

  async function removeContent(id: string) {
    await fetch(`/api/pulse-cms/content?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await refreshAll();
  }

  const filtered = useMemo(() => items.filter((item) => item.locale === locale), [items, locale]);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span>ب</span>
          <div><strong>BAYAN Pulse CMS</strong><small>Newsroom Platform</small></div>
        </div>

        <nav className={styles.tabs}>
          {[
            ["dashboard","الرئيسية"],
            ["content","غرفة الأخبار"],
            ["stories","Stories"],
            ["edition","إصدار اليوم"],
            ["heroes","Hero"],
            ["calendar","الجدول"],
            ["analytics","التحليلات"],
          ].map(([id,label]) => (
            <button key={id} className={tab===id?styles.activeTab:""} onClick={()=>setTab(id)}>{label}</button>
          ))}
        </nav>

        <div className={styles.actions}>
          <select value={locale} onChange={(e)=>setLocale(e.target.value as PulseLocale)}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
          <a href="/pulse" target="_blank" rel="noreferrer">معاينة ↗</a>
          <button className={styles.primary} onClick={()=>{setEditing({...emptyContent,locale});setTab("editor")}}>محتوى جديد</button>
        </div>
      </header>

      {message && <div className={styles.toast}>{message}</div>}

      <section className={styles.shell}>
        <aside className={styles.sidebar}>
          <span>NEWSROOM</span>
          <button onClick={()=>setTab("dashboard")}>لوحة اليوم</button>
          <button onClick={()=>setTab("content")}>جميع المحتوى</button>
          <button onClick={()=>setTab("stories")}>Stories Studio</button>
          <button onClick={()=>setTab("edition")}>Today's Edition</button>
          <button onClick={()=>setTab("heroes")}>Hero Editor</button>
          <button onClick={()=>setTab("calendar")}>Publishing Calendar</button>
          <button onClick={()=>setTab("analytics")}>Analytics</button>
          <div className={styles.sidebarFooter}>
            <small>النسخة</small><strong>Pulse CMS 1.0</strong>
          </div>
        </aside>

        <section className={styles.content}>
          {tab === "dashboard" && <Dashboard metrics={metrics} items={filtered} onEdit={(item)=>{setEditing(item);setTab("editor")}} />}
          {tab === "content" && <ContentTable items={filtered} onEdit={(item)=>{setEditing(item);setTab("editor")}} onDelete={removeContent} />}
          {tab === "stories" && <ContentTable items={filtered.filter((item)=>item.type==="story")} onEdit={(item)=>{setEditing(item);setTab("editor")}} onDelete={removeContent} />}
          {tab === "edition" && <EditionBuilder items={filtered.filter((item)=>item.status==="published")} locale={locale} />}
          {tab === "heroes" && <HeroEditor heroes={heroes} locale={locale} onSaved={refreshAll} />}
          {tab === "calendar" && <CalendarView items={filtered} />}
          {tab === "analytics" && <AnalyticsView metrics={metrics} items={filtered} />}
          {tab === "editor" && <ContentEditor value={editing} onChange={setEditing} onSave={saveContent} />}
        </section>
      </section>
    </main>
  );
}

function Dashboard({ metrics, items, onEdit }: {
  metrics: Metrics;
  items: PulseContentDocument[];
  onEdit: (item: PulseContentDocument)=>void;
}) {
  return (
    <>
      <header className={styles.pageHeader}>
        <div><span>TODAY</span><h1>غرفة أخبار نبض بيان</h1><p>إدارة كل ما يظهر في النبض من مكان واحد.</p></div>
      </header>
      <div className={styles.metricGrid}>
        {[
          ["المسودات",metrics.drafts],
          ["قيد المراجعة",metrics.review],
          ["مجدول",metrics.scheduled],
          ["منشور",metrics.published],
        ].map(([label,value])=><article key={String(label)}><strong>{Number(value)}</strong><span>{label}</span></article>)}
      </div>
      <div className={styles.dashboardGrid}>
        <section className={styles.panel}>
          <header><h2>آخر المحتوى</h2></header>
          {items.slice(0,6).map((item)=>(
            <button className={styles.recentItem} key={item.id} onClick={()=>onEdit(item)}>
              <span>{item.type}</span><strong>{item.title}</strong><small>{item.status}</small>
            </button>
          ))}
        </section>
        <section className={styles.panel}>
          <header><h2>حالة المنصة</h2></header>
          <div className={styles.health}><i/><strong>النبض متصل</strong><p>الصفحة العامة متصلة بمصادر المحتوى الحالية.</p></div>
        </section>
      </div>
    </>
  );
}

function ContentTable({ items, onEdit, onDelete }: {
  items: PulseContentDocument[];
  onEdit:(item:PulseContentDocument)=>void;
  onDelete:(id:string)=>void;
}) {
  return (
    <>
      <header className={styles.pageHeader}>
        <div><span>CONTENT PIPELINE</span><h1>غرفة الأخبار</h1><p>المسودات، المراجعة، الجدولة والنشر.</p></div>
      </header>
      <div className={styles.table}>
        <div className={styles.tableHead}><span>العنوان</span><span>النوع</span><span>القناة</span><span>الحالة</span><span>الإجراءات</span></div>
        {items.map((item)=>(
          <article className={styles.tableRow} key={item.id}>
            <div><strong>{item.title}</strong><small>{item.excerpt}</small></div>
            <span>{item.type}</span>
            <span>{item.channel}</span>
            <span className={styles.status}>{item.status}</span>
            <div className={styles.rowActions}>
              <button onClick={()=>onEdit(item)}>تحرير</button>
              <button onClick={()=>onDelete(item.id)}>حذف</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function ContentEditor({ value, onChange, onSave }: {
  value: PulseContentDocument;
  onChange:(value:PulseContentDocument)=>void;
  onSave:(status?:PulseStatus)=>void;
}) {
  return (
    <>
      <header className={styles.pageHeader}>
        <div><span>EDITOR</span><h1>{value.id ? "تحرير المحتوى" : "محتوى جديد"}</h1><p>اكتب، راجع، جدولة، ثم انشر.</p></div>
      </header>
      <div className={styles.editorGrid}>
        <section className={styles.editorMain}>
          <label><span>العنوان</span><input value={value.title} onChange={(e)=>onChange({...value,title:e.target.value})} placeholder="اكتب عنوانًا واضحًا..." /></label>
          <label><span>المقدمة</span><textarea value={value.excerpt || ""} onChange={(e)=>onChange({...value,excerpt:e.target.value})} rows={3}/></label>
          <label><span>المحتوى</span><textarea value={value.body || ""} onChange={(e)=>onChange({...value,body:e.target.value})} rows={14}/></label>
          <label><span>رابط صورة الغلاف</span><input value={value.coverUrl || ""} onChange={(e)=>onChange({...value,coverUrl:e.target.value})}/></label>
        </section>
        <aside className={styles.editorAside}>
          <label><span>النوع</span><select value={value.type} onChange={(e)=>onChange({...value,type:e.target.value as PulseContentType})}>{contentTypes.map((item)=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span>القناة</span><select value={value.channel} onChange={(e)=>onChange({...value,channel:e.target.value as PulseChannel})}>{channels.map((item)=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span>الحالة</span><select value={value.status} onChange={(e)=>onChange({...value,status:e.target.value as PulseStatus})}><option value="draft">مسودة</option><option value="review">مراجعة</option><option value="scheduled">مجدول</option><option value="published">منشور</option><option value="archived">مؤرشف</option></select></label>
          <label><span>الكاتب</span><input value={value.authorName || ""} onChange={(e)=>onChange({...value,authorName:e.target.value})}/></label>
          <label className={styles.checkbox}><input type="checkbox" checked={Boolean(value.isFeatured)} onChange={(e)=>onChange({...value,isFeatured:e.target.checked})}/><span>محتوى مميز</span></label>
          <label className={styles.checkbox}><input type="checkbox" checked={Boolean(value.isBreaking)} onChange={(e)=>onChange({...value,isBreaking:e.target.checked})}/><span>خبر عاجل</span></label>
          <label className={styles.checkbox}><input type="checkbox" checked={Boolean(value.isLive)} onChange={(e)=>onChange({...value,isLive:e.target.checked})}/><span>مباشر</span></label>
          <div className={styles.publishActions}>
            <button onClick={()=>onSave("draft")}>حفظ مسودة</button>
            <button onClick={()=>onSave("review")}>إرسال للمراجعة</button>
            <button className={styles.primary} onClick={()=>onSave("published")}>نشر الآن</button>
          </div>
        </aside>
      </div>
    </>
  );
}

function HeroEditor({ heroes, locale, onSaved }: {
  heroes: PulseHeroDocument[];
  locale: PulseLocale;
  onSaved:()=>void;
}) {
  const slots = ["morning","day","evening","night"] as const;
  return (
    <>
      <header className={styles.pageHeader}><div><span>HERO SYSTEM</span><h1>Hero حسب الوقت</h1><p>أربع تجارب مستقلة للصباح والنهار والمساء والليل.</p></div></header>
      <div className={styles.heroEditorGrid}>
        {slots.map((slot)=><HeroSlot key={slot} slot={slot} locale={locale} value={heroes.find((item)=>item.slot===slot)} onSaved={onSaved}/>)}
      </div>
    </>
  );
}

function HeroSlot({ slot, locale, value, onSaved }: {
  slot:"morning"|"day"|"evening"|"night";
  locale:PulseLocale;
  value?:PulseHeroDocument;
  onSaved:()=>void;
}) {
  const [draft,setDraft]=useState<PulseHeroDocument>(
    value || {
      id:`${locale}-${slot}`,locale,slot,eyebrow:slot.toUpperCase(),
      title:"",description:"",imageUrl:"",
      primaryLabel:"اقرأ إصدار اليوم",primaryHref:"#today",enabled:true
    }
  );
  useEffect(()=>{if(value)setDraft(value)},[value]);
  async function save(){
    await fetch("/api/pulse-cms/heroes",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(draft)
    });
    onSaved();
  }
  return (
    <article className={styles.heroSlot}>
      <span>{slot}</span>
      <input value={draft.title} onChange={(e)=>setDraft({...draft,title:e.target.value})} placeholder="عنوان Hero"/>
      <textarea value={draft.description} onChange={(e)=>setDraft({...draft,description:e.target.value})} rows={3}/>
      <input value={draft.imageUrl} onChange={(e)=>setDraft({...draft,imageUrl:e.target.value})} placeholder="رابط الصورة"/>
      <button onClick={save}>حفظ</button>
    </article>
  );
}

function EditionBuilder({ items, locale }: {
  items: PulseContentDocument[];
  locale: PulseLocale;
}) {
  const [lead,setLead]=useState("");
  const [side,setSide]=useState<string[]>([]);
  async function save(){
    await fetch("/api/pulse-cms/edition",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({locale,leadContentId:lead,sideContentIds:side})
    });
  }
  return (
    <>
      <header className={styles.pageHeader}><div><span>TODAY'S EDITION</span><h1>بناء إصدار اليوم</h1><p>حدد الخبر الرئيسي والقصص الجانبية.</p></div></header>
      <div className={styles.editionBuilder}>
        <label><span>Lead Story</span><select value={lead} onChange={(e)=>setLead(e.target.value)}><option value="">اختر...</option>{items.map((item)=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <div className={styles.editionList}>
          {items.slice(0,12).map((item)=>(
            <label key={item.id}>
              <input type="checkbox" checked={side.includes(item.id)} onChange={(e)=>setSide(e.target.checked?[...side,item.id]:side.filter((id)=>id!==item.id))}/>
              <span>{item.title}</span>
            </label>
          ))}
        </div>
        <button className={styles.primary} onClick={save}>حفظ إصدار اليوم</button>
      </div>
    </>
  );
}

function CalendarView({ items }: { items: PulseContentDocument[] }) {
  return (
    <>
      <header className={styles.pageHeader}><div><span>PUBLISHING CALENDAR</span><h1>الجدول التحريري</h1><p>المحتوى المجدول والفعاليات القادمة.</p></div></header>
      <div className={styles.calendar}>
        {items.filter((item)=>item.status==="scheduled" || item.type==="event").map((item)=>(
          <article key={item.id}><span>{item.scheduledAt || item.publishedAt || "غير محدد"}</span><h3>{item.title}</h3><small>{item.type}</small></article>
        ))}
      </div>
    </>
  );
}

function AnalyticsView({ metrics, items }: { metrics: Metrics; items: PulseContentDocument[] }) {
  return (
    <>
      <header className={styles.pageHeader}><div><span>ANALYTICS</span><h1>أداء المحتوى</h1><p>نظرة تشغيلية على حجم المحتوى وحالته.</p></div></header>
      <div className={styles.metricGrid}>
        {Object.entries(metrics).map(([key,value])=><article key={key}><strong>{value}</strong><span>{key}</span></article>)}
      </div>
      <section className={styles.panel}>
        <h2>توزيع القنوات</h2>
        {channels.map((channel)=>{
          const count=items.filter((item)=>item.channel===channel.value).length;
          return <div className={styles.bar} key={channel.value}><span>{channel.label}</span><i style={{width:`${Math.min(100,count*12)}%`}}/><strong>{count}</strong></div>
        })}
      </section>
    </>
  );
}
