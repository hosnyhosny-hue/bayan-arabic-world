"use client";

import {
  BarChart3,
  CalendarDays,
  FileText,
  ImagePlus,
  Images,
  Newspaper,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";
import WorldHeader from "@/src/components/world/WorldHeader";
import { useWorld } from "@/src/context/WorldContext";

export default function AdminPage() {
  const { isArabic, direction, playSound } = useWorld();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  function handleFile(file?: File) {
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    playSound("success");
  }

  return (
    <main dir={direction} className="admin-world">
      <div className="admin-frame">
        <WorldHeader />

        <section className="admin-heading">
          <div>
            <small>BAYAN CMS</small>
            <h1>
              {isArabic
                ? "لوحة إدارة المحتوى"
                : "Content Management"}
            </h1>
            <p>
              {isArabic
                ? "إدارة الأخبار والفعاليات والوسائط والمحتوى التعليمي."
                : "Manage news, events, media and learning content."}
            </p>
          </div>

          <BarChart3 size={40} />
        </section>

        <section className="admin-stat-grid">
          {[
            [Newspaper, "24", isArabic ? "منشورًا" : "Posts"],
            [Images, "68", isArabic ? "ملف وسائط" : "Media Files"],
            [CalendarDays, "5", isArabic ? "فعاليات قادمة" : "Upcoming Events"],
          ].map(([Icon, value, label]) => {
            const CardIcon = Icon as typeof Newspaper;

            return (
              <article key={String(label)}>
                <CardIcon />
                <strong>{String(value)}</strong>
                <span>{String(label)}</span>
              </article>
            );
          })}
        </section>

        <section className="admin-grid">
          <article className="upload-panel">
            <div className="panel-title">
              <ImagePlus />
              <div>
                <h2>
                  {isArabic
                    ? "مركز الوسائط"
                    : "Media Centre"}
                </h2>
                <p>
                  {isArabic
                    ? "اختر صورة أو فيديو لمعاينته قبل النشر."
                    : "Select an image or video to preview before publishing."}
                </p>
              </div>
            </div>

            <label className="upload-zone">
              <UploadCloud size={46} />
              <strong>
                {isArabic
                  ? "اضغط لاختيار ملف"
                  : "Click to select a file"}
              </strong>
              <span>JPG, PNG, WebP, GIF, MP4</span>

              <input
                type="file"
                accept="image/*,video/mp4"
                onChange={(event) =>
                  handleFile(event.target.files?.[0])
                }
              />
            </label>

            {preview && (
              <div className="media-preview">
                {fileName.toLowerCase().endsWith(".mp4") ? (
                  <video src={preview} controls />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" />
                )}
                <strong>{fileName}</strong>
              </div>
            )}
          </article>

          <article className="quick-editor">
            <div className="panel-title">
              <FileText />
              <div>
                <h2>
                  {isArabic ? "منشور جديد" : "New Post"}
                </h2>
                <p>
                  {isArabic
                    ? "اكتب مسودة سريعة للمحتوى."
                    : "Create a quick content draft."}
                </p>
              </div>
            </div>

            <input
              placeholder={isArabic ? "عنوان المنشور" : "Post title"}
            />

            <textarea
              rows={8}
              placeholder={
                isArabic
                  ? "اكتب تفاصيل المنشور هنا..."
                  : "Write your post here..."
              }
            />

            <button
              type="button"
              onClick={() => playSound("success")}
            >
              {isArabic ? "حفظ المسودة" : "Save Draft"}
            </button>
          </article>
        </section>
      </div>
    </main>
  );
}
