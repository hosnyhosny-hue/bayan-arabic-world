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
  metrics: {
    drafts: 0,
    review: 0,
    scheduled: 0,
    publishedToday: 0,
    activeStories: 0,
    todayEvents: 0,
    breakingNews: 0,
    mediaIssues: 0,
  },
  activities: [],
  health: [],
  generatedAt: new Date().toISOString(),
};

const roleLabels: Record<PulseControlRole, string> = {
  "super-admin": "Super Admin",
  "pulse-director": "Pulse Director",
  editor: "Editor",
  reviewer: "Reviewer",
  publisher: "Publisher",
  "events-manager": "Events Manager",
  "media-manager": "Media Manager",
  "arabic-bee-manager": "Arabic Bee Manager",
  "analytics-viewer": "Analytics Viewer",
};

export default function PulseControlCenterApp() {
  const [payload, setPayload] = useState<Payload>(emptyPayload);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<PulseControlRole>("super-admin");
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
      if (event.key === "Escape") setCommandOpen(false);
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch("/api/pulse-control-center/dashboard", { cache: "no-store" });
      if (response.ok) setPayload(await response.json());
    } finally {
      setLoading(false);
    }
  }

  const navigation = useMemo(
    () => pulseControlNavigation.filter((item) => !item.permission || can(role, item.permission)),
    [role]
  );

  const metrics = [
    ["المسودات", payload.metrics.drafts, "✎"],
    ["بانتظار المراجعة", payload.metrics.review, "✓"],
    ["المجدول", payload.metrics.scheduled, "◷"],
    ["المنشور اليوم", payload.metrics.publishedToday, "↑"],
    ["Stories نشطة", payload.metrics.activeStories, "◉"],
    ["فعاليات اليوم", payload.metrics.todayEvents, "▦"],
    ["أخبار عاجلة", payload.metrics.breakingNews, "!"],
    ["مشكلات وسائط", payload.metrics.mediaIssues, "◇"],
  ];

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/admin/cms/pulse-control-center" className={styles.brand}>
          <span>ب</span>
          <div><strong>BAYAN Pulse</strong><small>Control Center</small></div>
        </Link>

        <button className={styles.commandTrigger} onClick={() => setCommandOpen(true)}>
          <span>⌕</span><strong>ابحث أو نفّذ أمرًا</strong><kbd>⌘ K</kbd>
        </button>

        <div className={styles.topActions}>
          <select value={role} onChange={(event) => setRole(event.target.value as PulseControlRole)}>
            {Object.entries(roleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <a href="/pulse" target="_blank" rel="noreferrer">معاينة النبض ↗</a>
          <div className={styles.avatar}>م</div>
        </div>
      </header>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <span>NEWSROOM OS</span>
          <nav>
            {navigation.map((item) => (
              <Link
                href={item.href}
                key={item.id}
                className={item.id === "overview" ? styles.active : ""}
              >
                <span>{item.icon}</span><strong>{item.label}</strong>
              </Link>
            ))}
          </nav>

          <section className={styles.roleCard}>
            <small>الدور الحالي</small>
            <strong>{roleLabels[role]}</strong>
            <span>{rolePermissions[role].length.toLocaleString("ar-QA")} صلاحية</span>
          </section>

          <footer>
            <i />
            <div><strong>المنصة تعمل</strong><small>آخر فحص قبل لحظات</small></div>
          </footer>
        </aside>

        <section className={styles.content}>
          <header className={styles.pageHeader}>
            <div>
              <span>COMMAND CENTER</span>
              <h1>هذه حالة نبض بيان الآن.</h1>
              <p>رؤية تشغيلية موحدة للمحتوى، النشر، القصص والفعاليات.</p>
            </div>
            <div>
              <button onClick={refresh}>{loading ? "جارٍ التحديث…" : "تحديث البيانات"}</button>
              <Link href="/admin/pulse-cms">+ إنشاء محتوى</Link>
            </div>
          </header>

          {payload.degraded && (
            <div className={styles.warning}>
              بعض مؤشرات البيانات غير متاحة، لكن الواجهة العامة لم تتأثر.
            </div>
          )}

          <section className={styles.metricGrid}>
            {metrics.map(([label, value, icon]) => (
              <article key={String(label)}>
                <div><span>{icon}</span><small>LIVE</small></div>
                <strong>{loading ? "—" : Number(value).toLocaleString("ar-QA")}</strong>
                <h2>{label}</h2>
              </article>
            ))}
          </section>

          <section className={styles.mainGrid}>
            <article className={styles.panel}>
              <header><div><span>EDITORIAL FLOW</span><h2>مسار العمل اليوم</h2></div><Link href="/admin/pulse-cms">فتح غرفة الأخبار</Link></header>
              <div className={styles.workflow}>
                {[
                  ["مسودة", payload.metrics.drafts],
                  ["مراجعة", payload.metrics.review],
                  ["اعتماد", 0],
                  ["مجدول", payload.metrics.scheduled],
                  ["منشور", payload.metrics.publishedToday],
                ].map(([label, value], index) => (
                  <div key={String(label)}>
                    <span>{index + 1}</span><strong>{label}</strong><b>{Number(value).toLocaleString("ar-QA")}</b>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.panel}>
              <header><div><span>PLATFORM HEALTH</span><h2>صحة المنصة</h2></div></header>
              <div className={styles.healthList}>
                {payload.health.map((item) => (
                  <div className={styles.healthItem} key={item.id}>
                    <i className={styles[item.status]} />
                    <div><strong>{item.label}</strong><small>{item.detail}</small></div>
                    <b>{item.status}</b>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className={styles.bottomGrid}>
            <article className={styles.panel}>
              <header><div><span>ACTIVITY</span><h2>آخر العمليات</h2></div></header>
              {payload.activities.length ? (
                payload.activities.map((item) => (
                  <div className={styles.activity} key={item.id}>
                    <span>•</span>
                    <div><strong>{item.action}</strong><p>{item.entityTitle}</p><small>{item.actorName}</small></div>
                  </div>
                ))
              ) : (
                <div className={styles.empty}>
                  <span>≡</span><strong>لم تُسجل عمليات بعد</strong><p>ستظهر هنا عمليات الإنشاء والمراجعة والنشر.</p>
                </div>
              )}
            </article>

            <article className={styles.panel}>
              <header><div><span>QUICK ACTIONS</span><h2>إجراءات سريعة</h2></div></header>
              <div className={styles.quickGrid}>
                {[
                  ["خبر جديد", "✎", "/admin/pulse-cms"],
                  ["Story جديدة", "◉", "/admin/cms/pulse-control-center/stories"],
                  ["فعالية", "◷", "/admin/cms/pulse-control-center/events"],
                  ["إدارة Hero", "◫", "/admin/cms/pulse-control-center/hero"],
                  ["إصدار اليوم", "▤", "/admin/cms/pulse-control-center/edition"],
                  ["رفع وسائط", "▧", "/admin/cms/pulse-control-center/media"],
                ].map(([label, icon, href]) => (
                  <Link href={href} key={label}><span>{icon}</span><strong>{label}</strong><small>فتح ←</small></Link>
                ))}
              </div>
            </article>
          </section>
        </section>
      </section>

      {commandOpen && (
        <div className={styles.overlay} onMouseDown={() => setCommandOpen(false)}>
          <section className={styles.palette} onMouseDown={(event) => event.stopPropagation()}>
            <header><span>⌕</span><input autoFocus placeholder="اكتب اسم القسم أو الأمر…" /><kbd>ESC</kbd></header>
            <div>
              <small>انتقال سريع</small>
              {navigation.slice(0, 9).map((item) => (
                <Link href={item.href} key={item.id}><span>{item.icon}</span><strong>{item.label}</strong><b>↵</b></Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
