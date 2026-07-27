#!/usr/bin/env bash
set -euo pipefail

cd /Volumes/K/BAYAN/arabic-department-portal

echo "1/5 إنشاء اتصال Firebase Storage..."

cat > src/lib/firebase-cms-client.ts <<'EOF'
import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const cmsStorage = getStorage(app);
EOF

echo "2/5 إنشاء مركز الوسائط..."

cat > src/components/cms/MediaLibrary.tsx <<'EOF'
"use client";

import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { cmsStorage } from "@/src/lib/firebase-cms-client";

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

type UploadItem = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
};

const MEDIA_COLLECTION = "cms_media";

const allowedExtensions = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "svg",
  "mp4", "webm", "mov",
  "mp3", "wav",
  "pdf", "doc", "docx",
  "xls", "xlsx",
  "ppt", "pptx",
  "zip",
]);

function safeFileName(name: string) {
  const extension = name.includes(".")
    ? `.${name.split(".").pop()?.toLowerCase()}`
    : "";

  const base = name
    .replace(/\.[^/.]+$/, "")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\-_]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return `${base || "file"}${extension}`;
}

function formatSize(size = 0) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaLibrary() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [folder, setFolder] = useState("general");
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/cms/documents?collection=${MEDIA_COLLECTION}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load media");
      }

      setItems(result.items ?? []);
    } catch (error) {
      console.error(error);
      setMessage("تعذر تحميل مكتبة الوسائط.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function saveMetadata(
    file: File,
    url: string,
    storagePath: string
  ) {
    const response = await fetch("/api/admin/cms/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection: MEDIA_COLLECTION,
        data: {
          titleAr: file.name,
          titleEn: file.name,
          name: file.name,
          url,
          path: storagePath,
          folder,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          status: "published",
          visible: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Unable to save media metadata");
    }
  }

  async function uploadFiles(files: File[]) {
    setMessage("");

    const validFiles = files.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      return allowedExtensions.has(extension);
    });

    if (!validFiles.length) {
      setMessage("الملفات المختارة ليست من الصيغ المدعومة.");
      return;
    }

    for (const file of validFiles) {
      const uploadId = crypto.randomUUID();

      setUploads((current) => [
        {
          id: uploadId,
          name: file.name,
          progress: 0,
          status: "uploading",
        },
        ...current,
      ]);

      const storagePath =
        `bayan-cms/${folder}/${Date.now()}-${safeFileName(file.name)}`;

      try {
        await new Promise<void>((resolve, reject) => {
          const storageReference = ref(cmsStorage, storagePath);

          const task = uploadBytesResumable(storageReference, file, {
            contentType: file.type || "application/octet-stream",
            customMetadata: {
              originalName: file.name,
              source: "BAYAN CMS",
            },
          });

          task.on(
            "state_changed",
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );

              setUploads((current) =>
                current.map((entry) =>
                  entry.id === uploadId
                    ? { ...entry, progress }
                    : entry
                )
              );
            },
            (error) => {
              console.error(error);

              setUploads((current) =>
                current.map((entry) =>
                  entry.id === uploadId
                    ? { ...entry, status: "error" }
                    : entry
                )
              );

              reject(error);
            },
            async () => {
              try {
                const url = await getDownloadURL(task.snapshot.ref);

                await saveMetadata(file, url, storagePath);

                setUploads((current) =>
                  current.map((entry) =>
                    entry.id === uploadId
                      ? { ...entry, progress: 100, status: "done" }
                      : entry
                  )
                );

                resolve();
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } catch (error) {
        console.error(error);
        setMessage(
          "تعذر رفع ملف. تأكد من تفعيل Firebase Storage وقواعد الوصول."
        );
      }
    }

    await loadItems();
  }

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length) {
      uploadFiles(files);
    }

    event.target.value = "";
  }

  function dropFiles(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    const files = Array.from(event.dataTransfer.files);

    if (files.length) {
      uploadFiles(files);
    }
  }

  async function deleteMedia(item: MediaItem) {
    const name = item.name || item.titleAr || "الملف";

    if (!window.confirm(`هل تريد حذف ${name}؟`)) {
      return;
    }

    try {
      if (item.path) {
        await deleteObject(ref(cmsStorage, item.path));
      }

      const response = await fetch("/api/admin/cms/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: MEDIA_COLLECTION,
          id: item.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to delete media");
      }

      await loadItems();
    } catch (error) {
      console.error(error);
      setMessage("تعذر حذف الملف.");
    }
  }

  async function copyLink(url?: string) {
    if (!url) return;

    await navigator.clipboard.writeText(url);
    setMessage("تم نسخ رابط الملف.");

    window.setTimeout(() => setMessage(""), 1800);
  }

  const filteredItems = items.filter((item) => {
    const text = [
      item.name,
      item.titleAr,
      item.folder,
      item.mimeType,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <main dir="rtl" className="cms-page">
      <header className="cms-heading">
        <div>
          <span>BAYAN MEDIA LIBRARY</span>
          <h1>مركز الوسائط</h1>
          <p>
            ارفع الصور والفيديوهات والمستندات، ثم استخدمها في جميع
            أقسام الموقع.
          </p>
        </div>
      </header>

      <section className="bayan-media-layout">
        <article className="cms-card">
          <h2>رفع ملفات جديدة</h2>

          <label className="bayan-media-field">
            مجلد الملف
            <select
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
            >
              <option value="general">عام</option>
              <option value="arabic-a">اللغة العربية أ</option>
              <option value="arabic-b">اللغة العربية ب</option>
              <option value="student-portal">بوابة الطلاب</option>
              <option value="parent-portal">بوابة أولياء الأمور</option>
              <option value="achievements">الإنجازات</option>
              <option value="events">الفعاليات</option>
              <option value="gallery">المعرض الإعلامي</option>
              <option value="magazines">المجلة الرقمية</option>
              <option value="resources">مكتبة الموارد</option>
              <option value="creativity">إبداعات الطلاب</option>
              <option value="newsletters">النشرة الأسبوعية</option>
              <option value="studio">استوديو بيان</option>
            </select>
          </label>

          <div
            className={
              dragging
                ? "bayan-upload-zone is-dragging"
                : "bayan-upload-zone"
            }
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragging(false);
            }}
            onDrop={dropFiles}
          >
            <div className="bayan-upload-icon">↑</div>
            <strong>اضغط أو اسحب الملفات هنا</strong>
            <p>
              صور، فيديو، صوت، PDF، Word، Excel، PowerPoint وZIP
            </p>

            <input
              ref={inputRef}
              hidden
              multiple
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.mp4,.webm,.mov,.mp3,.wav,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
              onChange={selectFiles}
            />
          </div>

          {uploads.length > 0 && (
            <div className="bayan-upload-list">
              {uploads.map((upload) => (
                <div key={upload.id} className="bayan-upload-row">
                  <div>
                    <strong>{upload.name}</strong>
                    <span>
                      {upload.status === "done"
                        ? "تم الرفع"
                        : upload.status === "error"
                          ? "فشل الرفع"
                          : `${upload.progress}%`}
                    </span>
                  </div>

                  <div className="bayan-progress">
                    <span style={{ width: `${upload.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {message && <p className="cms-message">{message}</p>}
        </article>

        <article className="cms-card">
          <div className="bayan-media-toolbar">
            <div>
              <h2>الملفات المرفوعة</h2>
              <p>{filteredItems.length} ملف</p>
            </div>

            <input
              value={search}
              placeholder="البحث عن ملف..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="cms-empty">جارٍ تحميل الملفات...</div>
          ) : filteredItems.length === 0 ? (
            <div className="cms-empty">
              لا توجد ملفات مرفوعة حتى الآن.
            </div>
          ) : (
            <div className="bayan-media-grid">
              {filteredItems.map((item) => (
                <article key={item.id} className="bayan-media-card">
                  <div className="bayan-media-preview">
                    {item.mimeType?.startsWith("image/") && item.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.name || item.titleAr || "Media"}
                      />
                    ) : item.mimeType?.startsWith("video/") && item.url ? (
                      <video
                        src={item.url}
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <div className="bayan-file-icon">FILE</div>
                    )}
                  </div>

                  <div className="bayan-media-details">
                    <strong>
                      {item.name || item.titleAr || "ملف بدون اسم"}
                    </strong>

                    <p>
                      {item.folder || "general"} · {formatSize(item.size)}
                    </p>
                  </div>

                  <div className="bayan-media-actions">
                    <button
                      type="button"
                      onClick={() => copyLink(item.url)}
                    >
                      نسخ الرابط
                    </button>

                    <button
                      type="button"
                      className="danger"
                      onClick={() => deleteMedia(item)}
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
EOF

echo "3/5 إنشاء صفحة مركز الوسائط..."

cat > "app/(protected)/admin/cms/media/page.tsx" <<'EOF'
import MediaLibrary from "@/src/components/cms/MediaLibrary";

export default function MediaPage() {
  return <MediaLibrary />;
}
EOF

echo "4/5 إضافة التصميم..."

cat >> "app/(protected)/admin/cms/cms.css" <<'EOF'

/* BAYAN Media Center */

.bayan-media-layout {
  display: grid;
  grid-template-columns: minmax(330px, .7fr) minmax(0, 1.3fr);
  gap: 20px;
  align-items: start;
}

.bayan-media-field {
  display: grid;
  gap: 8px;
  margin-bottom: 17px;
  color: #214b3f;
  font-size: 13px;
  font-weight: 800;
}

.bayan-media-field select,
.bayan-media-toolbar input {
  min-height: 44px;
  padding: 10px 13px;
  border: 1px solid #dce8e3;
  border-radius: 12px;
  outline: none;
  background: #fbfdfc;
  color: #17473a;
  font: inherit;
}

.bayan-upload-zone {
  display: grid;
  place-items: center;
  min-height: 250px;
  padding: 30px;
  border: 2px dashed #9ddfc7;
  border-radius: 20px;
  background: #f2fbf7;
  color: #07845e;
  text-align: center;
  cursor: pointer;
  transition: .2s ease;
}

.bayan-upload-zone:hover,
.bayan-upload-zone.is-dragging {
  border-color: #07986b;
  background: #e6f8f0;
  transform: translateY(-2px);
}

.bayan-upload-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: #dff5ec;
  font-size: 35px;
  font-weight: 900;
}

.bayan-upload-zone strong {
  margin-top: 13px;
}

.bayan-upload-zone p {
  margin: 7px 0 0;
  color: #73877f;
  font-size: 11px;
}

.bayan-upload-list {
  display: grid;
  gap: 9px;
  margin-top: 16px;
}

.bayan-upload-row {
  padding: 12px;
  border: 1px solid #dfeae5;
  border-radius: 13px;
}

.bayan-upload-row > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.bayan-upload-row strong {
  overflow: hidden;
  color: #17473a;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bayan-upload-row span {
  color: #71867e;
  font-size: 10px;
}

.bayan-progress {
  height: 6px;
  margin-top: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6efeb;
}

.bayan-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #08a572;
}

.bayan-media-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 19px;
}

.bayan-media-toolbar h2 {
  margin: 0 !important;
}

.bayan-media-toolbar p {
  margin: 4px 0 0;
  color: #7a8d85;
  font-size: 11px;
}

.bayan-media-toolbar input {
  width: min(280px, 100%);
}

.bayan-media-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 13px;
}

.bayan-media-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #dfeae5;
  border-radius: 16px;
  background: #fff;
}

.bayan-media-preview {
  display: grid;
  place-items: center;
  height: 145px;
  overflow: hidden;
  background: #edf6f2;
}

.bayan-media-preview img,
.bayan-media-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bayan-file-icon {
  color: #07845e;
  font-size: 15px;
  font-weight: 900;
}

.bayan-media-details {
  padding: 12px 12px 8px;
}

.bayan-media-details strong {
  display: block;
  overflow: hidden;
  color: #173f34;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bayan-media-details p {
  margin: 5px 0 0;
  color: #81928c;
  font-size: 9px;
}

.bayan-media-actions {
  display: flex;
  gap: 7px;
  padding: 5px 12px 12px;
}

.bayan-media-actions button {
  min-height: 33px;
  padding: 6px 10px;
  border: 0;
  border-radius: 9px;
  background: #e9f7f1;
  color: #07845e;
  font: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.bayan-media-actions button.danger {
  background: #fff0ef;
  color: #b42318;
}

@media (max-width: 1150px) {
  .bayan-media-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .bayan-media-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .bayan-media-toolbar input {
    width: 100%;
  }

  .bayan-media-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .bayan-media-grid {
    grid-template-columns: 1fr;
  }
}
EOF

echo "5/5 إنشاء قواعد Firebase Storage..."

cat > storage.rules <<'EOF'
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /bayan-cms/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
EOF

python3 - <<'PY'
import json
from pathlib import Path

path = Path("firebase.json")

try:
    data = json.loads(path.read_text()) if path.exists() else {}
except Exception:
    data = {}

data["storage"] = {"rules": "storage.rules"}

path.write_text(
    json.dumps(data, ensure_ascii=False, indent=2) + "\n"
)
PY

echo "تشغيل فحص البناء..."

rm -rf .next
npm run build

echo
echo "✅ تم تثبيت مركز الوسائط بنجاح."
echo "الرابط: http://localhost:3000/admin/cms/media"
