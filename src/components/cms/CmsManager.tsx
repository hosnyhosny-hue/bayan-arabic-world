"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Item = {
  id: string;
  titleAr?: string;
  titleEn?: string;
  slug?: string;
  status?: string;
  visible?: boolean;
  descriptionAr?: string;
};

type Props = {
  title: string;
  description: string;
  collection: string;
  allowSlug?: boolean;
};

const initialForm = {
  titleAr: "",
  titleEn: "",
  slug: "",
  descriptionAr: "",
  status: "draft",
  visible: true,
};

export default function CmsManager({
  title,
  description,
  collection,
  allowSlug = true,
}: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    const response = await fetch(
      `/api/admin/cms/documents?collection=${encodeURIComponent(collection)}`,
      { cache: "no-store" }
    );
    const result = await response.json();
    setItems(result.items || []);
    setLoading(false);
  }, [collection]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/cms/documents", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection,
        id: editingId,
        data: form,
      }),
    });

    if (!response.ok) {
      setMessage("تعذر حفظ البيانات.");
      setSaving(false);
      return;
    }

    setForm(initialForm);
    setEditingId(null);
    setMessage("تم الحفظ بنجاح.");
    await loadItems();
    setSaving(false);
  }

  function edit(item: Item) {
    setEditingId(item.id);
    setForm({
      titleAr: item.titleAr || "",
      titleEn: item.titleEn || "",
      slug: item.slug || "",
      descriptionAr: item.descriptionAr || "",
      status: item.status || "draft",
      visible: item.visible !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!window.confirm("هل تريد حذف هذا العنصر؟")) return;

    await fetch("/api/admin/cms/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection, id }),
    });

    await loadItems();
  }

  return (
    <main dir="rtl" className="cms-page">
      <header className="cms-heading">
        <div>
          <span>BAYAN CMS</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>

      <div className="cms-grid">
        <form className="cms-card cms-form" onSubmit={submit}>
          <h2>{editingId ? "تعديل العنصر" : "إضافة عنصر جديد"}</h2>

          <label>
            العنوان بالعربية
            <input
              required
              value={form.titleAr}
              onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
            />
          </label>

          <label>
            العنوان بالإنجليزية
            <input
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
            />
          </label>

          {allowSlug && (
            <label>
              رابط الصفحة
              <input
                dir="ltr"
                placeholder="example-page"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </label>
          )}

          <label>
            الوصف أو المحتوى المختصر
            <textarea
              rows={7}
              value={form.descriptionAr}
              onChange={(e) =>
                setForm({ ...form, descriptionAr: e.target.value })
              }
            />
          </label>

          <label>
            حالة النشر
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">مسودة</option>
              <option value="published">منشور</option>
              <option value="archived">مؤرشف</option>
            </select>
          </label>

          <label className="cms-check">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) =>
                setForm({ ...form, visible: e.target.checked })
              }
            />
            إظهار العنصر في الموقع
          </label>

          <button disabled={saving}>
            {saving ? "جارٍ الحفظ..." : editingId ? "حفظ التعديلات" : "إنشاء"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cms-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
              }}
            >
              إلغاء التعديل
            </button>
          )}

          {message && <p className="cms-message">{message}</p>}
        </form>

        <section className="cms-card">
          <div className="cms-list-title">
            <h2>العناصر الحالية</h2>
            <button type="button" onClick={loadItems}>
              تحديث
            </button>
          </div>

          {loading ? (
            <p>جارٍ التحميل...</p>
          ) : items.length === 0 ? (
            <div className="cms-empty">لا توجد عناصر حتى الآن.</div>
          ) : (
            <div className="cms-list">
              {items.map((item) => (
                <article key={item.id} className="cms-item">
                  <div>
                    <h3>{item.titleAr || "بدون عنوان"}</h3>
                    <p>{item.titleEn}</p>
                    <div className="cms-badges">
                      <span>{item.status || "draft"}</span>
                      <span>{item.visible === false ? "مخفي" : "ظاهر"}</span>
                    </div>
                  </div>
                  <div className="cms-actions">
                    <button type="button" onClick={() => edit(item)}>
                      تعديل
                    </button>
                    <button
                      type="button"
                      className="cms-danger"
                      onClick={() => remove(item.id)}
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
