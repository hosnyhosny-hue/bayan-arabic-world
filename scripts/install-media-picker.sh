#!/usr/bin/env bash
set -euo pipefail

cd /Volumes/K/BAYAN/arabic-department-portal

echo "1/3 إنشاء محرر المحتوى مع مكتبة الوسائط..."

cat > src/components/cms/CmsManager.tsx <<'EOF'
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type MediaItem = {
  id: string;
  name?: string;
  titleAr?: string;
  url?: string;
  path?: string;
  mimeType?: string;
  size?: number;
  folder?: string;
};

type CmsItem = {
  id: string;
  titleAr?: string;
  titleEn?: string;
  slug?: string;
  status?: string;
  visible?: boolean;
  descriptionAr?: string;

  mediaId?: string;
  mediaName?: string;
  mediaUrl?: string;
  mediaType?: string;
};

type Props = {
  title: string;
  description: string;
  collection: string;
  allowSlug?: boolean;
};

type FormState = {
  titleAr: string;
  titleEn: string;
  slug: string;
  descriptionAr: string;
  status: string;
  visible: boolean;

  mediaId: string;
  mediaName: string;
  mediaUrl: string;
  mediaType: string;
};

const emptyForm: FormState = {
  titleAr: "",
  titleEn: "",
  slug: "",
  descriptionAr: "",
  status: "draft",
  visible: true,

  mediaId: "",
  mediaName: "",
  mediaUrl: "",
  mediaType: "",
};

function isImage(mimeType = "") {
  return mimeType.startsWith("image/");
}

function isVideo(mimeType = "") {
  return mimeType.startsWith("video/");
}

export default function CmsManager({
  title,
  description,
  collection,
  allowSlug = true,
}: Props) {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaFolder, setMediaFolder] = useState("all");

  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/cms/documents?collection=${encodeURIComponent(collection)}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load records");
      }

      setItems(result.items || []);
    } catch (error) {
      console.error(error);
      setMessage("تعذر تحميل العناصر.");
    } finally {
      setLoading(false);
    }
  }, [collection]);

  const loadMedia = useCallback(async () => {
    setMediaLoading(true);

    try {
      const response = await fetch(
        "/api/admin/cms/documents?collection=cms_media",
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load media");
      }

      setMediaItems(result.items || []);
    } catch (error) {
      console.error(error);
      setMessage("تعذر تحميل مكتبة الوسائط.");
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (mediaOpen) {
      loadMedia();
    }
  }, [mediaOpen, loadMedia]);

  const mediaFolders = useMemo(() => {
    return Array.from(
      new Set(
        mediaItems
          .map((item) => item.folder)
          .filter((folder): folder is string => Boolean(folder))
      )
    ).sort();
  }, [mediaItems]);

  const filteredMedia = useMemo(() => {
    const searchText = mediaSearch.trim().toLowerCase();

    return mediaItems.filter((item) => {
      const matchesFolder =
        mediaFolder === "all" || item.folder === mediaFolder;

      const searchableText = [
        item.name,
        item.titleAr,
        item.folder,
        item.mimeType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText || searchableText.includes(searchText);

      return matchesFolder && matchesSearch;
    });
  }, [mediaItems, mediaFolder, mediaSearch]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/cms/documents", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collection,
          id: editingId,
          data: form,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save record");
      }

      setForm(emptyForm);
      setEditingId(null);
      setMessage(
        editingId
          ? "تم حفظ التعديلات بنجاح."
          : "تم إنشاء العنصر بنجاح."
      );

      await loadItems();
    } catch (error) {
      console.error(error);
      setMessage("تعذر حفظ البيانات.");
    } finally {
      setSaving(false);
    }
  }

  function edit(item: CmsItem) {
    setEditingId(item.id);

    setForm({
      titleAr: item.titleAr || "",
      titleEn: item.titleEn || "",
      slug: item.slug || "",
      descriptionAr: item.descriptionAr || "",
      status: item.status || "draft",
      visible: item.visible !== false,

      mediaId: item.mediaId || "",
      mediaName: item.mediaName || "",
      mediaUrl: item.mediaUrl || "",
      mediaType: item.mediaType || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  async function remove(id: string) {
    if (!window.confirm("هل تريد حذف هذا العنصر نهائيًا؟")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/cms/documents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collection,
          id,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to delete record");
      }

      await loadItems();
      setMessage("تم حذف العنصر.");
    } catch (error) {
      console.error(error);
      setMessage("تعذر حذف العنصر.");
    }
  }

  function selectMedia(item: MediaItem) {
    if (!item.url) {
      setMessage("هذا الملف لا يحتوي على رابط صالح.");
      return;
    }

    setForm((current) => ({
      ...current,
      mediaId: item.id,
      mediaName: item.name || item.titleAr || "ملف",
      mediaUrl: item.url || "",
      mediaType: item.mimeType || "",
    }));

    setMediaOpen(false);
    setMessage("تم إرفاق الملف بالمحتوى.");
  }

  function removeSelectedMedia() {
    setForm((current) => ({
      ...current,
      mediaId: "",
      mediaName: "",
      mediaUrl: "",
      mediaType: "",
    }));
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
          <h2>
            {editingId ? "تعديل العنصر" : "إضافة عنصر جديد"}
          </h2>

          <label>
            العنوان بالعربية
            <input
              required
              value={form.titleAr}
              onChange={(event) =>
                setForm({
                  ...form,
                  titleAr: event.target.value,
                })
              }
            />
          </label>

          <label>
            العنوان بالإنجليزية
            <input
              value={form.titleEn}
              onChange={(event) =>
                setForm({
                  ...form,
                  titleEn: event.target.value,
                })
              }
            />
          </label>

          {allowSlug && (
            <label>
              رابط الصفحة
              <input
                dir="ltr"
                placeholder="example-page"
                value={form.slug}
                onChange={(event) =>
                  setForm({
                    ...form,
                    slug: event.target.value,
                  })
                }
              />
            </label>
          )}

          <label>
            الوصف أو المحتوى
            <textarea
              rows={8}
              value={form.descriptionAr}
              onChange={(event) =>
                setForm({
                  ...form,
                  descriptionAr: event.target.value,
                })
              }
            />
          </label>

          <section className="bayan-media-selector">
            <div className="bayan-media-selector-heading">
              <div>
                <strong>الملف أو الصورة الرئيسية</strong>
                <p>
                  اختر ملفًا سبق رفعه داخل مركز الوسائط.
                </p>
              </div>

              <button
                type="button"
                className="bayan-open-media-button"
                onClick={() => setMediaOpen(true)}
              >
                اختيار من مكتبة الوسائط
              </button>
            </div>

            {!form.mediaUrl ? (
              <div className="bayan-no-media">
                لم يتم اختيار ملف.
              </div>
            ) : (
              <div className="bayan-selected-media">
                <div className="bayan-selected-media-preview">
                  {isImage(form.mediaType) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.mediaUrl}
                      alt={form.mediaName || "Selected media"}
                    />
                  ) : isVideo(form.mediaType) ? (
                    <video
                      src={form.mediaUrl}
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <span>FILE</span>
                  )}
                </div>

                <div className="bayan-selected-media-info">
                  <strong>
                    {form.mediaName || "ملف مرفق"}
                  </strong>
                  <p>{form.mediaType || "ملف"}</p>

                  <div>
                    <a
                      href={form.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      فتح الملف
                    </a>

                    <button
                      type="button"
                      onClick={removeSelectedMedia}
                    >
                      إزالة
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <label>
            حالة النشر
            <select
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value,
                })
              }
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
              onChange={(event) =>
                setForm({
                  ...form,
                  visible: event.target.checked,
                })
              }
            />

            إظهار العنصر في الموقع
          </label>

          <button type="submit" disabled={saving}>
            {saving
              ? "جارٍ الحفظ..."
              : editingId
                ? "حفظ التعديلات"
                : "إنشاء"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cms-secondary"
              onClick={resetForm}
            >
              إلغاء التعديل
            </button>
          )}

          {message && (
            <p className="cms-message">{message}</p>
          )}
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
            <div className="cms-empty">
              لا توجد عناصر حتى الآن.
            </div>
          ) : (
            <div className="cms-list">
              {items.map((item) => (
                <article key={item.id} className="cms-item">
                  <div className="bayan-cms-item-content">
                    {item.mediaUrl && (
                      <div className="bayan-cms-item-thumbnail">
                        {isImage(item.mediaType) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.mediaUrl}
                            alt={item.mediaName || item.titleAr || ""}
                          />
                        ) : (
                          <span>FILE</span>
                        )}
                      </div>
                    )}

                    <div>
                      <h3>
                        {item.titleAr || "بدون عنوان"}
                      </h3>

                      <p>{item.titleEn}</p>

                      {item.mediaName && (
                        <small>
                          المرفق: {item.mediaName}
                        </small>
                      )}

                      <div className="cms-badges">
                        <span>
                          {item.status === "published"
                            ? "منشور"
                            : item.status === "archived"
                              ? "مؤرشف"
                              : "مسودة"}
                        </span>

                        <span>
                          {item.visible === false
                            ? "مخفي"
                            : "ظاهر"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="cms-actions">
                    <button
                      type="button"
                      onClick={() => edit(item)}
                    >
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

      {mediaOpen && (
        <div
          className="bayan-media-modal-overlay"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setMediaOpen(false);
            }
          }}
        >
          <section
            className="bayan-media-modal"
            role="dialog"
            aria-modal="true"
            aria-label="مكتبة الوسائط"
          >
            <header className="bayan-media-modal-header">
              <div>
                <span>BAYAN MEDIA LIBRARY</span>
                <h2>اختيار ملف</h2>
              </div>

              <button
                type="button"
                onClick={() => setMediaOpen(false)}
                aria-label="إغلاق"
              >
                ×
              </button>
            </header>

            <div className="bayan-media-modal-toolbar">
              <input
                value={mediaSearch}
                placeholder="ابحث باسم الملف..."
                onChange={(event) =>
                  setMediaSearch(event.target.value)
                }
              />

              <select
                value={mediaFolder}
                onChange={(event) =>
                  setMediaFolder(event.target.value)
                }
              >
                <option value="all">كل المجلدات</option>

                {mediaFolders.map((folder) => (
                  <option key={folder} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={loadMedia}
              >
                تحديث
              </button>
            </div>

            <div className="bayan-media-modal-body">
              {mediaLoading ? (
                <div className="cms-empty">
                  جارٍ تحميل مكتبة الوسائط...
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="cms-empty">
                  لا توجد ملفات مطابقة.
                </div>
              ) : (
                <div className="bayan-media-picker-grid">
                  {filteredMedia.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      className="bayan-media-picker-item"
                      onClick={() => selectMedia(media)}
                    >
                      <div className="bayan-media-picker-preview">
                        {isImage(media.mimeType) && media.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media.url}
                            alt={
                              media.name ||
                              media.titleAr ||
                              "Media"
                            }
                          />
                        ) : isVideo(media.mimeType) &&
                          media.url ? (
                          <video
                            src={media.url}
                            preload="metadata"
                          />
                        ) : (
                          <span>FILE</span>
                        )}
                      </div>

                      <div className="bayan-media-picker-info">
                        <strong>
                          {media.name ||
                            media.titleAr ||
                            "ملف"}
                        </strong>

                        <small>
                          {media.folder || "general"}
                        </small>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <footer className="bayan-media-modal-footer">
              <a href="/admin/cms/media">
                فتح مركز الوسائط
              </a>

              <button
                type="button"
                onClick={() => setMediaOpen(false)}
              >
                إلغاء
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
EOF

echo "2/3 إضافة تنسيق منتقي الوسائط..."

cat >> "app/(protected)/admin/cms/cms.css" <<'EOF'

/* =========================================================
   BAYAN CMS Media Picker
   ========================================================= */

.bayan-media-selector {
  padding: 16px;
  border: 1px solid #dce8e3;
  border-radius: 15px;
  background: #f9fcfb;
}

.bayan-media-selector-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.bayan-media-selector-heading strong {
  display: block;
  color: #17473a;
  font-size: 13px;
}

.bayan-media-selector-heading p {
  margin: 5px 0 0;
  color: #7a8e86;
  font-size: 10px;
}

.bayan-open-media-button {
  min-height: 39px !important;
  padding: 8px 12px !important;
  background: #087f5b !important;
  font-size: 11px !important;
}

.bayan-no-media {
  margin-top: 13px;
  padding: 18px;
  border: 1px dashed #cbded6;
  border-radius: 12px;
  color: #7c9088;
  text-align: center;
  font-size: 11px;
}

.bayan-selected-media {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 14px;
  padding: 11px;
  border: 1px solid #d9e8e2;
  border-radius: 13px;
  background: #ffffff;
}

.bayan-selected-media-preview {
  display: grid;
  place-items: center;
  width: 90px;
  height: 70px;
  flex: 0 0 90px;
  overflow: hidden;
  border-radius: 10px;
  background: #eaf5f0;
  color: #087f5b;
  font-size: 12px;
  font-weight: 900;
}

.bayan-selected-media-preview img,
.bayan-selected-media-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bayan-selected-media-info {
  min-width: 0;
  flex: 1;
}

.bayan-selected-media-info strong {
  display: block;
  overflow: hidden;
  color: #17473a;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bayan-selected-media-info p {
  margin: 5px 0 8px;
  color: #82938d;
  font-size: 9px;
}

.bayan-selected-media-info > div {
  display: flex;
  gap: 8px;
}

.bayan-selected-media-info a,
.bayan-selected-media-info button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px !important;
  padding: 5px 9px !important;
  border: 0;
  border-radius: 8px;
  background: #e9f7f1 !important;
  color: #087f5b !important;
  text-decoration: none;
  font-size: 9px !important;
  font-weight: 800;
}

.bayan-selected-media-info button {
  background: #fff0ef !important;
  color: #b42318 !important;
}

.bayan-cms-item-content {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
}

.bayan-cms-item-thumbnail {
  display: grid;
  place-items: center;
  width: 72px;
  height: 58px;
  flex: 0 0 72px;
  overflow: hidden;
  border-radius: 10px;
  background: #eaf5f0;
  color: #087f5b;
  font-size: 9px;
  font-weight: 900;
}

.bayan-cms-item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bayan-cms-item-content small {
  display: block;
  margin-top: 6px;
  color: #7e9089;
  font-size: 9px;
}

.bayan-media-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 25px;
  background: rgba(4, 40, 31, .64);
  backdrop-filter: blur(5px);
}

.bayan-media-modal {
  display: flex;
  flex-direction: column;
  width: min(1050px, 96vw);
  max-height: 88vh;
  overflow: hidden;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 30px 90px rgba(0, 0, 0, .27);
}

.bayan-media-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 22px;
  border-bottom: 1px solid #e5eeea;
  background: linear-gradient(120deg, #073b2f, #087856);
  color: #ffffff;
}

.bayan-media-modal-header span {
  color: #f59e0b;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.bayan-media-modal-header h2 {
  margin: 4px 0 0;
  color: #ffffff;
  font-size: 22px;
}

.bayan-media-modal-header > button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 11px;
  background: rgba(255,255,255,.12);
  color: #ffffff;
  font-size: 25px;
  cursor: pointer;
}

.bayan-media-modal-toolbar {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 210px auto;
  gap: 10px;
  padding: 15px 20px;
  border-bottom: 1px solid #e7efeb;
  background: #f8fbfa;
}

.bayan-media-modal-toolbar input,
.bayan-media-modal-toolbar select {
  min-height: 42px;
  padding: 9px 12px;
  border: 1px solid #d8e6e0;
  border-radius: 11px;
  outline: none;
  background: #ffffff;
  color: #17473a;
  font: inherit;
}

.bayan-media-modal-toolbar button {
  min-height: 42px;
  padding: 8px 15px;
  border: 0;
  border-radius: 11px;
  background: #087f5b;
  color: #ffffff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.bayan-media-modal-body {
  flex: 1;
  min-height: 250px;
  padding: 20px;
  overflow-y: auto;
  background: #f3f7f5;
}

.bayan-media-picker-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
}

.bayan-media-picker-item {
  min-width: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid #dbe8e3;
  border-radius: 15px;
  background: #ffffff;
  color: inherit;
  text-align: right;
  cursor: pointer;
  transition: .2s ease;
}

.bayan-media-picker-item:hover {
  border-color: #48b995;
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(7, 98, 72, .11);
}

.bayan-media-picker-preview {
  display: grid;
  place-items: center;
  height: 135px;
  overflow: hidden;
  background: #e9f4ef;
  color: #087f5b;
  font-size: 12px;
  font-weight: 900;
}

.bayan-media-picker-preview img,
.bayan-media-picker-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bayan-media-picker-info {
  padding: 11px;
}

.bayan-media-picker-info strong {
  display: block;
  overflow: hidden;
  color: #17473a;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bayan-media-picker-info small {
  display: block;
  margin-top: 5px;
  color: #81928c;
  font-size: 8px;
}

.bayan-media-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid #e4ede9;
  background: #ffffff;
}

.bayan-media-modal-footer a,
.bayan-media-modal-footer button {
  min-height: 38px;
  padding: 8px 13px;
  border: 0;
  border-radius: 10px;
  background: #e9f7f1;
  color: #087f5b;
  font: inherit;
  font-size: 10px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
}

.bayan-media-modal-footer button {
  background: #edf2f0;
  color: #425b52;
}

@media (max-width: 900px) {
  .bayan-media-picker-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .bayan-media-selector-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .bayan-media-modal-toolbar {
    grid-template-columns: 1fr;
  }

  .bayan-media-picker-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 430px) {
  .bayan-media-modal-overlay {
    padding: 8px;
  }

  .bayan-media-picker-grid {
    grid-template-columns: 1fr;
  }

  .bayan-selected-media {
    align-items: stretch;
    flex-direction: column;
  }

  .bayan-selected-media-preview {
    width: 100%;
    height: 150px;
  }
}
EOF

echo "3/3 فحص البناء..."

rm -rf .next
npm run build

echo
echo "✅ تم تركيب منتقي مكتبة الوسائط."
echo "جرّبه داخل:"
echo "http://localhost:3000/admin/cms/news"
