"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { cmsStorage } from "@/src/lib/firebase-cms-client";

type HeroVideoData = {
  enabled: boolean;
  videoUrl: string;
  videoPath: string;
  posterUrl: string;
  posterPath: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
};

const emptyData: HeroVideoData = {
  enabled: false,
  videoUrl: "",
  videoPath: "",
  posterUrl: "",
  posterPath: "",
  titleAr: "نافذة بيان",
  titleEn: "Bayan Spotlight",
  descriptionAr: "فيلم قسم اللغة العربية لهذا الشهر",
  descriptionEn: "Arabic Department Film of the Month",
};

export default function HeroVideoManager() {
  const [data, setData] = useState<HeroVideoData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/admin/cms/hero-video", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "تعذر تحميل البيانات.");
      }

      setData({
        ...emptyData,
        ...result.data,
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "تعذر تحميل البيانات."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let active = true;

    fetch("/api/admin/cms/hero-video", {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "تعذر تحميل البيانات.");
        }

        if (active) {
          setData({
            ...emptyData,
            ...result.data,
          });
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "تعذر تحميل البيانات."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateField<K extends keyof HeroVideoData>(
    field: K,
    value: HeroVideoData[K]
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function uploadFile(
    file: File,
    type: "video" | "poster"
  ) {
    const setUploading =
      type === "video"
        ? setUploadingVideo
        : setUploadingPoster;

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    const allowedPosterTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maximumSize =
      type === "video"
        ? 1024 * 1024 * 1024
        : 15 * 1024 * 1024;

    const allowedTypes =
      type === "video"
        ? allowedVideoTypes
        : allowedPosterTypes;

    setMessage("");
    setError("");
    setUploadProgress(0);

    if (!allowedTypes.includes(file.type)) {
      setError(
        type === "video"
          ? "نوع الفيديو غير مدعوم. استخدم MP4 أو WebM أو MOV."
          : "نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WebP."
      );
      return;
    }

    if (file.size <= 0 || file.size > maximumSize) {
      setError(
        type === "video"
          ? "يجب ألا يتجاوز حجم الفيديو 1 جيجابايت."
          : "يجب ألا يتجاوز حجم الصورة 15 ميجابايت."
      );
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() ||
        (type === "video" ? "mp4" : "jpg");

      const safeName = file.name
        .replace(/\.[^/.]+$/, "")
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || type;

      const uniqueId =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);

      const storagePath =
        `bayan-cms/hero-video/${type}/` +
        `${Date.now()}-${uniqueId}-${safeName}.${extension}`;

      const storageReference = ref(
        cmsStorage,
        storagePath
      );

      const uploadTask = uploadBytesResumable(
        storageReference,
        file,
        {
          contentType:
            file.type || "application/octet-stream",
          cacheControl:
            "public,max-age=31536000,immutable",
          customMetadata: {
            section: "homepage-hero-video",
            uploadType: type,
          },
        }
      );

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (
                snapshot.bytesTransferred /
                snapshot.totalBytes
              ) * 100
            );

            setUploadProgress(progress);
          },
          (firebaseError) => {
            console.error(
              "Firebase hero upload error:",
              firebaseError
            );

            reject(firebaseError);
          },
          () => {
            setUploadProgress(100);
            resolve();
          }
        );
      });

      const downloadUrl = await getDownloadURL(
        uploadTask.snapshot.ref
      );

      if (type === "video") {
        setData((current) => ({
          ...current,
          videoUrl: downloadUrl,
          videoPath: storagePath,
        }));
      } else {
        setData((current) => ({
          ...current,
          posterUrl: downloadUrl,
          posterPath: storagePath,
        }));
      }

      setMessage(
        type === "video"
          ? "تم رفع الفيديو بنجاح. اضغط حفظ التعديلات لنشره."
          : "تم رفع صورة الغلاف بنجاح. اضغط حفظ التعديلات."
      );
    } catch (uploadError) {
      const firebaseCode =
        typeof uploadError === "object" &&
        uploadError !== null &&
        "code" in uploadError
          ? String(
              (uploadError as { code?: unknown }).code
            )
          : "";

      let errorMessage =
        uploadError instanceof Error
          ? uploadError.message
          : "فشل رفع الملف إلى Firebase Storage.";

      if (
        firebaseCode.includes("storage/unauthorized")
      ) {
        errorMessage =
          "ليس لديك إذن لرفع الملف إلى Firebase Storage. تحقق من قواعد Storage.";
      } else if (
        firebaseCode.includes("storage/canceled")
      ) {
        errorMessage = "تم إلغاء رفع الملف.";
      } else if (
        firebaseCode.includes("storage/retry-limit-exceeded")
      ) {
        errorMessage =
          "تعذر إكمال الرفع بعد عدة محاولات. تحقق من اتصال الإنترنت.";
      } else if (
        firebaseCode.includes("storage/quota-exceeded")
      ) {
        errorMessage =
          "تم تجاوز سعة Firebase Storage المتاحة للمشروع.";
      } else if (
        firebaseCode.includes("storage/bucket-not-found")
      ) {
        errorMessage =
          "لم يتم العثور على Firebase Storage Bucket.";
      }

      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      await uploadFile(file, "video");
    }

    event.target.value = "";
  }

  async function handlePosterChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      await uploadFile(file, "poster");
    }

    event.target.value = "";
  }

  async function saveChanges(event: FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/cms/hero-video", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "فشل حفظ التعديلات.");
      }

      setMessage(result.message || "تم حفظ التعديلات بنجاح.");
      await loadData(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "فشل حفظ التعديلات."
      );
    } finally {
      setSaving(false);
    }
  }

  async function unpublish() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updatedData = {
        ...data,
        enabled: false,
      };

      const response = await fetch("/api/admin/cms/hero-video", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "فشل إلغاء النشر.");
      }

      setData(updatedData);
      setMessage("تم إلغاء نشر الفيديو مع الاحتفاظ بالملفات.");
    } catch (unpublishError) {
      setError(
        unpublishError instanceof Error
          ? unpublishError.message
          : "فشل إلغاء النشر."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAll() {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف فيديو الشهر وصورة الغلاف نهائيًا؟ لا يمكن التراجع عن هذا الإجراء."
    );

    if (!confirmed) return;

    setDeleting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/cms/hero-video", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "فشل الحذف.");
      }

      setData(emptyData);
      setMessage(
        result.message || "تم حذف فيديو الشهر وجميع ملفاته."
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "فشل الحذف."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <p>جارٍ تحميل إعدادات فيديو الشهر...</p>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page} dir="rtl">
      <section style={styles.header}>
        <div>
          <span style={styles.badge}>BAYAN CMS</span>
          <h1 style={styles.title}>إدارة فيديو الشهر</h1>
          <p style={styles.subtitle}>
            ارفع الفيديو، عدّل بياناته، انشره أو احذفه من مكان واحد.
          </p>
        </div>

        <div
          style={{
            ...styles.status,
            background: data.enabled ? "#dcfce7" : "#f1f5f9",
            color: data.enabled ? "#166534" : "#475569",
          }}
        >
          {data.enabled ? "منشور الآن" : "غير منشور"}
        </div>
      </section>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={saveChanges} style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>الفيديو</h2>

          {data.videoUrl ? (
            <video
              src={data.videoUrl}
              poster={data.posterUrl || undefined}
              controls
              preload="metadata"
              style={styles.video}
            />
          ) : (
            <div style={styles.emptyMedia}>
              لا يوجد فيديو مرفوع حاليًا
            </div>
          )}

          <label style={styles.uploadButton}>
            {uploadingVideo
              ? `جارٍ رفع الفيديو... ${uploadProgress}%`
              : data.videoUrl
                ? "استبدال الفيديو"
                : "رفع فيديو"}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoChange}
              disabled={uploadingVideo || saving || deleting}
              hidden
            />
          </label>

          {data.videoUrl && (
            <p style={styles.pathText}>
              مسار الملف: {data.videoPath || "رابط خارجي"}
            </p>
          )}
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>صورة الغلاف</h2>

          {data.posterUrl ? (
            <img
              src={data.posterUrl}
              alt="صورة غلاف فيديو الشهر"
              style={styles.poster}
            />
          ) : (
            <div style={styles.emptyPoster}>
              لا توجد صورة غلاف
            </div>
          )}

          <label style={styles.secondaryUploadButton}>
            {uploadingPoster
              ? `جارٍ رفع الصورة... ${uploadProgress}%`
              : data.posterUrl
                ? "استبدال صورة الغلاف"
                : "رفع صورة الغلاف"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePosterChange}
              disabled={uploadingPoster || saving || deleting}
              hidden
            />
          </label>
        </section>

        <section style={{ ...styles.card, ...styles.fullWidth }}>
          <h2 style={styles.sectionTitle}>بيانات العرض</h2>

          <div style={styles.fieldsGrid}>
            <label style={styles.label}>
              العنوان العربي
              <input
                style={styles.input}
                value={data.titleAr}
                onChange={(event) =>
                  updateField("titleAr", event.target.value)
                }
                maxLength={140}
              />
            </label>

            <label style={styles.label}>
              العنوان الإنجليزي
              <input
                style={styles.input}
                dir="ltr"
                value={data.titleEn}
                onChange={(event) =>
                  updateField("titleEn", event.target.value)
                }
                maxLength={140}
              />
            </label>

            <label style={styles.label}>
              الوصف العربي
              <textarea
                style={styles.textarea}
                value={data.descriptionAr}
                onChange={(event) =>
                  updateField("descriptionAr", event.target.value)
                }
                maxLength={500}
              />
            </label>

            <label style={styles.label}>
              الوصف الإنجليزي
              <textarea
                style={styles.textarea}
                dir="ltr"
                value={data.descriptionEn}
                onChange={(event) =>
                  updateField("descriptionEn", event.target.value)
                }
                maxLength={500}
              />
            </label>
          </div>

          <label style={styles.switchRow}>
            <input
              type="checkbox"
              checked={data.enabled}
              onChange={(event) =>
                updateField("enabled", event.target.checked)
              }
              disabled={!data.videoUrl}
            />
            <span>
              نشر الفيديو في الصفحة الرئيسية
            </span>
          </label>
        </section>

        <section style={{ ...styles.actions, ...styles.fullWidth }}>
          <button
            type="submit"
            style={styles.saveButton}
            disabled={
              saving ||
              deleting ||
              uploadingVideo ||
              uploadingPoster
            }
          >
            {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </button>

          <button
            type="button"
            style={styles.unpublishButton}
            onClick={unpublish}
            disabled={
              !data.enabled ||
              saving ||
              deleting
            }
          >
            إلغاء النشر
          </button>

          <button
            type="button"
            style={styles.deleteButton}
            onClick={deleteAll}
            disabled={
              (!data.videoUrl && !data.posterUrl) ||
              deleting ||
              saving
            }
          >
            {deleting ? "جارٍ الحذف..." : "حذف نهائي"}
          </button>
        </section>
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%)",
    padding: "32px",
    fontFamily: "inherit",
  },
  header: {
    maxWidth: "1200px",
    margin: "0 auto 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
  },
  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#0f172a",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  title: {
    margin: "12px 0 6px",
    fontSize: "34px",
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
  },
  status: {
    padding: "10px 18px",
    borderRadius: "999px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  grid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "22px",
  },
  card: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "18px",
    color: "#0f172a",
    fontSize: "20px",
  },
  video: {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "18px",
    background: "#020617",
    objectFit: "cover",
  },
  poster: {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "18px",
    objectFit: "cover",
    border: "1px solid #e2e8f0",
  },
  emptyMedia: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "18px",
    background: "#0f172a",
    color: "#cbd5e1",
  },
  emptyPoster: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "18px",
    background: "#f1f5f9",
    color: "#64748b",
  },
  uploadButton: {
    display: "block",
    marginTop: "16px",
    padding: "13px 18px",
    borderRadius: "14px",
    background: "#0f766e",
    color: "#fff",
    textAlign: "center",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryUploadButton: {
    display: "block",
    marginTop: "16px",
    padding: "13px 18px",
    borderRadius: "14px",
    background: "#334155",
    color: "#fff",
    textAlign: "center",
    cursor: "pointer",
    fontWeight: 700,
  },
  pathText: {
    marginTop: "12px",
    color: "#64748b",
    fontSize: "12px",
    overflowWrap: "anywhere",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  fieldsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },
  label: {
    display: "grid",
    gap: "8px",
    color: "#334155",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "13px 14px",
    fontSize: "15px",
    background: "#fff",
    color: "#0f172a",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    resize: "vertical",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "13px 14px",
    fontSize: "15px",
    background: "#fff",
    color: "#0f172a",
  },
  switchRow: {
    marginTop: "22px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "14px",
    background: "#f8fafc",
    color: "#0f172a",
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "flex-start",
  },
  saveButton: {
    border: 0,
    borderRadius: "14px",
    padding: "14px 24px",
    background: "#15803d",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  unpublishButton: {
    border: "1px solid #f59e0b",
    borderRadius: "14px",
    padding: "14px 24px",
    background: "#fffbeb",
    color: "#92400e",
    fontWeight: 800,
    cursor: "pointer",
  },
  deleteButton: {
    border: 0,
    borderRadius: "14px",
    padding: "14px 24px",
    background: "#dc2626",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  success: {
    maxWidth: "1200px",
    margin: "0 auto 18px",
    padding: "14px 18px",
    borderRadius: "14px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
  },
  error: {
    maxWidth: "1200px",
    margin: "0 auto 18px",
    padding: "14px 18px",
    borderRadius: "14px",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
  },
};
