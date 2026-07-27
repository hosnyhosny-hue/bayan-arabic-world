"use client";

import { ChangeEvent, useEffect, useState } from "react";

type Settings = {
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

const defaults: Settings = {
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

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  font: "inherit",
};

function safeName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .toLowerCase();
}

export default function HeroVideoManager() {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/cms/hero-video", { cache: "no-store" })
      .then(async response => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "تعذر تحميل الإعدادات");
        }

        setSettings({ ...defaults, ...result.data });
      })
      .catch(error => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    setSettings(current => ({ ...current, [key]: value }));
  }

  async function uploadFile(
    file: File,
    type: "video" | "poster"
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    setProgress("جارٍ رفع الملف إلى الخادم...");

    const response = await fetch(
      "/api/admin/cms/hero-video/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "فشل رفع الملف."
      );
    }

    setProgress("اكتمل رفع الملف.");

    return {
      url: result.data.url as string,
      path: result.data.path as string,
    };
  }

  async function chooseFile(
    event: ChangeEvent<HTMLInputElement>,
    type: "video" | "poster"
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setMessage("");
    setProgress("بدء الرفع...");

    try {
      const uploaded = await uploadFile(file, type);

      setSettings(current => ({
        ...current,
        ...(type === "video"
          ? {
              videoUrl: uploaded.url,
              videoPath: uploaded.path,
            }
          : {
              posterUrl: uploaded.url,
              posterPath: uploaded.path,
            }),
      }));

      setMessage("تم رفع الملف. اضغط حفظ ونشر.");
    } catch (error) {
      console.error(error);
      setMessage(
        "فشل رفع الملف إلى الخادم."
      );
    } finally {
      setProgress("");
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/cms/hero-video",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "تعذر الحفظ");
      }

      setMessage("تم حفظ إعدادات فيديو الشهر بنجاح.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر الحفظ"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>جارٍ تحميل إعدادات فيديو الشهر...</p>;
  }

  return (
    <main
      dir="rtl"
      style={{
        display: "grid",
        gap: 22,
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <header>
        <h1>فيديو الشهر</h1>
        <p>
          ارفع الفيديو والغلاف ثم انشرهما على الصفحة الرئيسية.
        </p>
      </header>

      {message && (
        <div
          style={{
            padding: 14,
            background: "#f1f5f9",
            borderRadius: 12,
          }}
        >
          {message}
        </div>
      )}

      {progress && <strong>{progress}</strong>}

      <section
        style={{
          display: "grid",
          gap: 18,
          padding: 24,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 22,
        }}
      >
        <label>
          <strong>رفع الفيديو</strong>
          <input
            style={{ display: "block", marginTop: 10 }}
            type="file"
            accept="video/*"
            onChange={event => chooseFile(event, "video")}
          />
        </label>

        <label>
          <strong>رفع صورة الغلاف</strong>
          <input
            style={{ display: "block", marginTop: 10 }}
            type="file"
            accept="image/*"
            onChange={event => chooseFile(event, "poster")}
          />
        </label>

        <label>
          العنوان بالعربية
          <input
            style={inputStyle}
            value={settings.titleAr}
            onChange={event =>
              update("titleAr", event.target.value)
            }
          />
        </label>

        <label dir="ltr">
          English title
          <input
            style={inputStyle}
            value={settings.titleEn}
            onChange={event =>
              update("titleEn", event.target.value)
            }
          />
        </label>

        <label>
          الوصف بالعربية
          <textarea
            style={inputStyle}
            value={settings.descriptionAr}
            onChange={event =>
              update("descriptionAr", event.target.value)
            }
          />
        </label>

        <label dir="ltr">
          English description
          <textarea
            style={inputStyle}
            value={settings.descriptionEn}
            onChange={event =>
              update("descriptionEn", event.target.value)
            }
          />
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={event =>
              update("enabled", event.target.checked)
            }
          />{" "}
          نشر الفيديو على الصفحة الرئيسية
        </label>

        {settings.posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.posterUrl}
            alt="صورة الغلاف"
            style={{
              width: "100%",
              maxHeight: 380,
              objectFit: "cover",
              borderRadius: 18,
            }}
          />
        )}

        {settings.videoUrl && (
          <video
            src={settings.videoUrl}
            poster={settings.posterUrl || undefined}
            controls
            style={{
              width: "100%",
              borderRadius: 18,
              background: "black",
            }}
          />
        )}

        <button
          type="button"
          disabled={saving}
          onClick={save}
          style={{
            padding: "13px 20px",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
            background: "#166534",
            border: 0,
            borderRadius: 12,
          }}
        >
          {saving ? "جارٍ الحفظ..." : "حفظ ونشر"}
        </button>
      </section>
    </main>
  );
}
