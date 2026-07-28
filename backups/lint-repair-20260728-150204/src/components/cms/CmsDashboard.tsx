"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  FileText,
  FolderOpen,
  GraduationCap,
  Images,
  Newspaper,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

type DashboardData = {
  counts: Record<string, number>;
  activity: Array<{
    id: string;
    action?: string;
    title?: string;
    collection?: string;
  }>;
};

const cards = [
  {
    key: "pages",
    title: "الصفحات",
    href: "/admin/cms/pages",
    icon: FileText,
  },
  {
    key: "news",
    title: "الأخبار",
    href: "/admin/cms/news",
    icon: Newspaper,
  },
  {
    key: "events",
    title: "الفعاليات",
    href: "/admin/cms/events",
    icon: CalendarDays,
  },
  {
    key: "media",
    title: "الوسائط",
    href: "/admin/cms/media",
    icon: Images,
  },
  {
    key: "team",
    title: "فريق القسم",
    href: "/admin/cms/team",
    icon: Users,
  },
  {
    key: "students",
    title: "الطلاب المتميزون",
    href: "/admin/cms/students",
    icon: GraduationCap,
  },
  {
    key: "magazines",
    title: "المجلات",
    href: "/admin/cms/magazines",
    icon: Sparkles,
  },
  {
    key: "resources",
    title: "المصادر",
    href: "/admin/cms/resources",
    icon: FolderOpen,
  },
];

export default function CmsDashboard() {
  const [data, setData] = useState<DashboardData>({
    counts: {},
    activity: [],
  });
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/cms/stats", {
        cache: "no-store",
      });

      const result = await response.json();

      setData({
        counts: result.counts ?? {},
        activity: result.activity ?? [],
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <main dir="rtl" className="cms-page">
      <header className="cms-dashboard-hero">
        <div>
          <span>BAYAN CMS 2.0</span>
          <h1>مركز قيادة المحتوى</h1>
          <p>
            تحكّم في صفحات الموقع وأخباره وفعالياته ووسائطه دون تعديل البرمجة.
          </p>
        </div>

        <button
          type="button"
          className="cms-refresh-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? "cms-spin" : ""} />
          تحديث البيانات
        </button>
      </header>

      <section className="cms-stat-grid">
        {cards.map(({ key, title, href, icon: Icon }) => (
          <Link href={href} key={key} className="cms-stat-card">
            <div className="cms-stat-icon">
              <Icon size={23} />
            </div>

            <div>
              <strong>{loading ? "—" : data.counts[key] ?? 0}</strong>
              <span>{title}</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="cms-dashboard-grid">
        <article className="cms-card">
          <div className="cms-section-heading">
            <div>
              <span>اختصارات سريعة</span>
              <h2>إنشاء محتوى جديد</h2>
            </div>
          </div>

          <div className="cms-quick-actions">
            <Link href="/admin/cms/news">إضافة خبر</Link>
            <Link href="/admin/cms/events">إضافة فعالية</Link>
            <Link href="/admin/cms/pages">إنشاء صفحة</Link>
            <Link href="/admin/cms/media">رفع ملف</Link>
            <Link href="/admin/cms/magazines">إضافة مجلة</Link>
            <Link href="/admin/cms/team">إضافة عضو فريق</Link>
          </div>
        </article>

        <article className="cms-card">
          <div className="cms-section-heading">
            <div>
              <span>سجل النظام</span>
              <h2>آخر الأنشطة</h2>
            </div>

            <Link href="/admin/cms/activity">عرض الكل</Link>
          </div>

          {data.activity.length === 0 ? (
            <div className="cms-empty">
              لم تُسجّل أنشطة بعد.
            </div>
          ) : (
            <div className="cms-activity-list">
              {data.activity.map((activity) => (
                <div key={activity.id} className="cms-activity-row">
                  <span className="cms-activity-dot" />

                  <div>
                    <strong>
                      {activity.title || "عنصر في النظام"}
                    </strong>
                    <p>
                      {activity.action === "create"
                        ? "تم الإنشاء"
                        : activity.action === "update"
                          ? "تم التعديل"
                          : activity.action === "delete"
                            ? "تم الحذف"
                            : "نشاط جديد"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
