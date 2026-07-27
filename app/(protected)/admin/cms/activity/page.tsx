"use client";

import { useEffect, useState } from "react";

type Activity = {
  id: string;
  action?: string;
  title?: string;
  collection?: string;
};

export default function ActivityPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cms/documents?collection=cms_activity", {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((result) => setItems(result.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main dir="rtl" className="cms-page">
      <header className="cms-heading">
        <div>
          <span>BAYAN CMS</span>
          <h1>سجل النشاط</h1>
          <p>
            متابعة عمليات الإنشاء والتعديل والحذف التي تتم داخل النظام.
          </p>
        </div>
      </header>

      <section className="cms-card">
        {loading ? (
          <p>جارٍ تحميل سجل النشاط...</p>
        ) : items.length === 0 ? (
          <div className="cms-empty">
            لا توجد أنشطة مسجلة حتى الآن.
          </div>
        ) : (
          <div className="cms-activity-table">
            {items.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.title || "عنصر"}</strong>
                  <p>{item.collection || "النظام"}</p>
                </div>

                <span>
                  {item.action === "create"
                    ? "إنشاء"
                    : item.action === "update"
                      ? "تعديل"
                      : item.action === "delete"
                        ? "حذف"
                        : item.action || "نشاط"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
