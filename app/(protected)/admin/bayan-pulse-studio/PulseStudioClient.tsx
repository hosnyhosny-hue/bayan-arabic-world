"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./pulse-studio.module.css";

type StudioItem = {
  id: string;
  kind: "post" | "story" | "event" | "achievement" | "hero" | "gallery" | "video";
  title: string;
  excerpt?: string;
  status: "draft" | "review" | "approved" | "scheduled" | "published" | "archived";
  audience: "public" | "parents" | "students" | "staff" | "all";
  author?: string;
  updatedAt?: string;
  scheduledAt?: string;
  coverUrl?: string;
  category?: string;
};

const KIND_LABELS: Record<StudioItem["kind"], string> = {
  post: "منشور",
  story: "قصة",
  event: "فعالية",
  achievement: "إنجاز",
  hero: "واجهة اليوم",
  gallery: "معرض",
  video: "فيديو",
};

const FALLBACK_ITEMS: StudioItem[] = [
  {
    id: "welcome-draft",
    kind: "post",
    title: "مرحبًا بكم في نبض بيان",
    excerpt: "منشور تعريفي رئيسي لصفحة أولياء الأمور.",
    status: "draft",
    audience: "public",
    author: "فريق بيان",
    updatedAt: new Date().toISOString(),
    category: "إعلان",
  },
  {
    id: "arabic-bee-event",
    kind: "event",
    title: "تحدي Arabic Bee الأسبوعي",
    excerpt: "فعالية أسبوعية لتشجيع المفردات والتنافس الإيجابي.",
    status: "scheduled",
    audience: "all",
    author: "قسم اللغة العربية",
    updatedAt: new Date().toISOString(),
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    category: "Arabic Bee",
  },
  {
    id: "achievement-sample",
    kind: "achievement",
    title: "نجوم الأسبوع",
    excerpt: "بطاقة إنجاز قابلة للنشر في النبض.",
    status: "review",
    audience: "parents",
    author: "فريق الإنجازات",
    updatedAt: new Date().toISOString(),
    category: "إنجازات",
  },
];

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-QA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function statusLabel(status: StudioItem["status"]) {
  return {
    draft: "مسودة",
    review: "قيد المراجعة",
    approved: "معتمد",
    scheduled: "مجدول",
    published: "منشور",
    archived: "مؤرشف",
  }[status];
}

export default function PulseStudioClient() {
  const [items, setItems] = useState<StudioItem[]>(FALLBACK_ITEMS);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<StudioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("bayan-pulse-studio-intro-seen");
    if (seen) setIntroVisible(false);

    async function load() {
      try {
        const response = await fetch("/api/bayan-pulse-studio/content", {
          credentials: "include",
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.items) && data.items.length) setItems(data.items);
        }
      } catch {
        // Keep fallback items so the studio remains usable.
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const searchable = `${item.title} ${item.excerpt || ""} ${item.category || ""}`.toLowerCase();
      const matchesSearch = !normalized || searchable.includes(normalized);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, query, statusFilter]);

  const metrics = useMemo(() => ({
    total: items.length,
    published: items.filter((x) => x.status === "published").length,
    scheduled: items.filter((x) => x.status === "scheduled").length,
    review: items.filter((x) => x.status === "review").length,
  }), [items]);

  function tone(type: "open" | "success" | "hover") {
    if (!soundEnabled || typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = audioCtxRef.current || new AudioCtx();
    audioCtxRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const presets = {
      open: [392, 523.25],
      success: [523.25, 659.25],
      hover: [330, 392],
    };
    const [start, end] = presets[type];
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(end, now + 0.16);
    gain.gain.setValueAtTime(type === "hover" ? 0.02 : 0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  function enterStudio(withSound: boolean) {
    setSoundEnabled(withSound);
    sessionStorage.setItem("bayan-pulse-studio-intro-seen", "1");
    setIntroVisible(false);
    if (withSound) setTimeout(() => tone("open"), 80);
  }

  function openEditor(item?: StudioItem) {
    setEditing(item || {
      id: crypto.randomUUID(),
      kind: "post",
      title: "",
      excerpt: "",
      status: "draft",
      audience: "public",
      author: "فريق بيان",
      updatedAt: new Date().toISOString(),
      category: "عام",
    });
    setEditorOpen(true);
    tone("open");
  }

  async function saveItem(publish = false) {
    if (!editing || !editing.title.trim()) return;

    const next: StudioItem = {
      ...editing,
      status: publish ? "published" : editing.status,
      updatedAt: new Date().toISOString(),
    };

    setItems((current) => {
      const exists = current.some((item) => item.id === next.id);
      return exists
        ? current.map((item) => item.id === next.id ? next : item)
        : [next, ...current];
    });

    try {
      await fetch("/api/bayan-pulse-studio/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(next),
      });
    } catch {
      // Local optimistic save remains visible.
    }

    setEditorOpen(false);
    setEditing(null);
    tone("success");
  }

  async function archiveItem(item: StudioItem) {
    const updated = { ...item, status: "archived" as const, updatedAt: new Date().toISOString() };
    setItems((current) => current.map((x) => x.id === item.id ? updated : x));
    try {
      await fetch(`/api/bayan-pulse-studio/content?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {}
  }

  const sections = [
    ["dashboard", "⌂", "لوحة القيادة"],
    ["content", "✎", "المحتوى"],
    ["hero", "◫", "واجهة اليوم"],
    ["stories", "◉", "القصص"],
    ["calendar", "▦", "التقويم"],
    ["media", "▧", "مكتبة الوسائط"],
    ["analytics", "⌁", "التحليلات"],
    ["settings", "⚙", "الإعدادات"],
  ];

  return (
    <main className={styles.page}>
      {introVisible && (
        <section className={styles.intro}>
          <div className={styles.introOrb} />
          <div className={styles.introContent}>
            <span className={styles.introMark}>ب</span>
            <p>BAYAN CREATIVE SYSTEM</p>
            <h1>Pulse Studio</h1>
            <span className={styles.introLine} />
            <div className={styles.introActions}>
              <button onClick={() => enterStudio(true)}>دخول مع الصوت</button>
              <button className={styles.ghostButton} onClick={() => enterStudio(false)}>دخول هادئ</button>
            </div>
          </div>
        </section>
      )}

      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span>ب</span>
          <div>
            <strong>BAYAN</strong>
            <small>Pulse Studio</small>
          </div>
        </div>

        <nav>
          {sections.map(([id, icon, label]) => (
            <button
              key={id}
              onMouseEnter={() => tone("hover")}
              onClick={() => setActiveSection(id)}
              className={activeSection === id ? styles.activeNav : ""}
            >
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={() => setSoundEnabled((v) => !v)}>
            {soundEnabled ? "🔊 الصوت يعمل" : "🔇 الصوت متوقف"}
          </button>
          <a href="/parents" target="_blank" rel="noreferrer">فتح صفحة العائلة ↗</a>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.eyebrow}>BAYAN PULSE STUDIO</span>
            <h1>{sections.find(([id]) => id === activeSection)?.[2]}</h1>
          </div>
          <div className={styles.topActions}>
            <div className={styles.search}>
              <span>⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث في الاستوديو..." />
            </div>
            <button className={styles.primaryButton} onClick={() => openEditor()}>＋ محتوى جديد</button>
          </div>
        </header>

        <section className={styles.heroPanel}>
          <div>
            <span className={styles.livePill}>● الاستوديو متصل</span>
            <h2>اصنع نبض المدرسة من مكان واحد</h2>
            <p>أنشئ المحتوى، راجعه، جدوله، وانشره إلى BAYAN Family دون تعديل الكود.</p>
          </div>
          <div className={styles.heroActions}>
            <button onClick={() => openEditor()}>منشور جديد</button>
            <button onClick={() => {
              setEditing({
                id: crypto.randomUUID(),
                kind: "hero",
                title: "",
                excerpt: "",
                status: "draft",
                audience: "public",
                author: "فريق بيان",
                updatedAt: new Date().toISOString(),
                category: "Hero",
              });
              setEditorOpen(true);
            }}>واجهة اليوم</button>
          </div>
        </section>

        <section className={styles.metrics}>
          <article><span>إجمالي المحتوى</span><strong>{metrics.total}</strong><small>كل الأنواع</small></article>
          <article><span>المنشور</span><strong>{metrics.published}</strong><small>ظاهر للجمهور</small></article>
          <article><span>المجدول</span><strong>{metrics.scheduled}</strong><small>قادم تلقائيًا</small></article>
          <article><span>قيد المراجعة</span><strong>{metrics.review}</strong><small>ينتظر الاعتماد</small></article>
        </section>

        <section className={styles.grid}>
          <article className={styles.mainCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.eyebrow}>CONTENT PIPELINE</span>
                <h2>مسار المحتوى</h2>
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">كل الحالات</option>
                <option value="draft">مسودة</option>
                <option value="review">قيد المراجعة</option>
                <option value="approved">معتمد</option>
                <option value="scheduled">مجدول</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>المحتوى</th>
                    <th>النوع</th>
                    <th>الحالة</th>
                    <th>الجمهور</th>
                    <th>آخر تحديث</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <button className={styles.titleButton} onClick={() => openEditor(item)}>
                          <strong>{item.title}</strong>
                          <small>{item.excerpt || "بدون وصف"}</small>
                        </button>
                      </td>
                      <td>{KIND_LABELS[item.kind]}</td>
                      <td><span className={`${styles.status} ${styles[item.status]}`}>{statusLabel(item.status)}</span></td>
                      <td>{item.audience}</td>
                      <td>{formatDate(item.updatedAt)}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button onClick={() => openEditor(item)}>تعديل</button>
                          <button onClick={() => archiveItem(item)}>أرشفة</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && <div className={styles.empty}>لا توجد نتائج مطابقة.</div>}
            </div>
          </article>

          <aside className={styles.rightColumn}>
            <article className={styles.sideCard}>
              <span className={styles.eyebrow}>QUICK CREATE</span>
              <h3>إنشاء سريع</h3>
              <div className={styles.quickCreate}>
                {(["post","story","event","achievement","hero","gallery"] as StudioItem["kind"][]).map((kind) => (
                  <button key={kind} onClick={() => {
                    setEditing({
                      id: crypto.randomUUID(),
                      kind,
                      title: "",
                      excerpt: "",
                      status: "draft",
                      audience: "public",
                      author: "فريق بيان",
                      updatedAt: new Date().toISOString(),
                      category: KIND_LABELS[kind],
                    });
                    setEditorOpen(true);
                  }}>
                    <span>{kind === "post" ? "✎" : kind === "story" ? "◉" : kind === "event" ? "▦" : kind === "achievement" ? "★" : kind === "hero" ? "◫" : "▧"}</span>
                    {KIND_LABELS[kind]}
                  </button>
                ))}
              </div>
            </article>

            <article className={styles.sideCard}>
              <span className={styles.eyebrow}>WORKFLOW</span>
              <h3>دورة النشر</h3>
              <div className={styles.workflow}>
                <span>مسودة</span><i>→</i><span>مراجعة</span><i>→</i><span>اعتماد</span><i>→</i><span>نشر</span>
              </div>
            </article>

            <article className={styles.aiCard}>
              <span>BAYAN AI</span>
              <h3>مساعد التحرير الذكي</h3>
              <p>يقترح العناوين، يلخص النصوص، ويجهز نسخة عربية وإنجليزية.</p>
              <button onClick={() => openEditor()}>ابدأ مسودة ذكية</button>
            </article>
          </aside>
        </section>
      </section>

      {editorOpen && editing && (
        <div className={styles.modalBackdrop} onMouseDown={() => setEditorOpen(false)}>
          <section className={styles.editor} onMouseDown={(e) => e.stopPropagation()}>
            <header>
              <div>
                <span className={styles.eyebrow}>VISUAL CONTENT EDITOR</span>
                <h2>{editing.title || "محتوى جديد"}</h2>
              </div>
              <button onClick={() => setEditorOpen(false)}>✕</button>
            </header>

            <div className={styles.editorGrid}>
              <label>
                <span>نوع المحتوى</span>
                <select value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value as StudioItem["kind"] })}>
                  {Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label>
                <span>الحالة</span>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as StudioItem["status"] })}>
                  <option value="draft">مسودة</option>
                  <option value="review">قيد المراجعة</option>
                  <option value="approved">معتمد</option>
                  <option value="scheduled">مجدول</option>
                  <option value="published">منشور</option>
                  <option value="archived">مؤرشف</option>
                </select>
              </label>

              <label className={styles.full}>
                <span>العنوان</span>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="اكتب عنوانًا قويًا..." />
              </label>

              <label className={styles.full}>
                <span>النص أو الوصف</span>
                <textarea value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} placeholder="اكتب محتوى النبض هنا..." />
              </label>

              <label>
                <span>الجمهور</span>
                <select value={editing.audience} onChange={(e) => setEditing({ ...editing, audience: e.target.value as StudioItem["audience"] })}>
                  <option value="public">عام</option>
                  <option value="parents">أولياء الأمور</option>
                  <option value="students">الطلاب</option>
                  <option value="staff">الموظفون</option>
                  <option value="all">الجميع</option>
                </select>
              </label>

              <label>
                <span>التصنيف</span>
                <input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </label>

              <label className={styles.full}>
                <span>رابط الغلاف أو الوسائط</span>
                <input value={editing.coverUrl || ""} onChange={(e) => setEditing({ ...editing, coverUrl: e.target.value })} placeholder="/uploads/..." />
              </label>
            </div>

            <footer>
              <button className={styles.secondaryButton} onClick={() => saveItem(false)}>حفظ كمسودة</button>
              <button className={styles.primaryButton} onClick={() => saveItem(true)}>نشر الآن</button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
