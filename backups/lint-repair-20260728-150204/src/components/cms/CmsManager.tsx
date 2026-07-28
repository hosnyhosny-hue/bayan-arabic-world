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
