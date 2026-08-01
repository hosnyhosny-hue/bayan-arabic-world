import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MEDIA_COLLECTION = "bayan_cms_media";
const MAX_FILE_SIZE = 12 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

type MediaRecord = Record<string, unknown> & {
  id: string;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function timestamp(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return null;
}

function safeFileName(name: string): string {
  const extension = name.includes(".")
    ? `.${name.split(".").pop()?.toLowerCase()}`
    : "";

  const base = name
    .replace(/\.[^/.]+$/, "")
    .normalize("NFKD")
    .replace(/[^\w\u0600-\u06ff-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);

  return `${base || "bayan-media"}${extension}`;
}

function firebaseDownloadUrl(
  bucketName: string,
  objectPath: string,
  token: string
): string {
  return [
    "https://firebasestorage.googleapis.com/v0/b/",
    encodeURIComponent(bucketName),
    "/o/",
    encodeURIComponent(objectPath),
    `?alt=media&token=${encodeURIComponent(token)}`,
  ].join("");
}

export async function GET(request: NextRequest) {
  try {
    const search = text(
      request.nextUrl.searchParams.get("search")
    ).toLowerCase();

    const snapshot = await bayanDb()
      .collection(MEDIA_COLLECTION)
      .limit(150)
      .get();

    const items: MediaRecord[] = snapshot.docs
      .map((document): MediaRecord => {
        const data = document.data() as Record<string, unknown>;

        return {
          id: document.id,
          ...data,
          createdAt:
            timestamp(data.createdAt) ??
            data.createdAt ??
            null,
        };
      })
      .filter((item) => {
        if (!search) return true;

        return [
          text(item.name),
          text(item.alt),
          text(item.originalName),
        ].some((value) =>
          value.toLowerCase().includes(search)
        );
      })
      .sort((a, b) =>
        text(b.createdAt).localeCompare(text(a.createdAt))
      );

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error) {
    console.error("[editorial/media][GET]", error);

    return NextResponse.json(
      {
        ok: false,
        error: "تعذر تحميل مكتبة الوسائط.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const alt = text(formData.get("alt"));

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: "اختر صورة لرفعها.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WEBP أو AVIF.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          ok: false,
          error: "حجم الصورة يجب ألا يتجاوز 12MB.",
        },
        { status: 400 }
      );
    }

    /*
     * bayanDb() يضمن تهيئة Firebase Admin
     * قبل استخدام Firebase Storage.
     */
    bayanDb();

    const bucket = getStorage().bucket(
      process.env.FIREBASE_STORAGE_BUCKET || undefined
    );

    const id = randomUUID();
    const token = randomUUID();
    const filename = safeFileName(file.name);
    const objectPath = `bayan-cms/editorial/${new Date()
      .toISOString()
      .slice(0, 10)}/${id}-${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const storageFile = bucket.file(objectPath);

    await storageFile.save(buffer, {
      resumable: false,
      contentType: file.type,
      metadata: {
        cacheControl: "public,max-age=31536000,immutable",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const url = firebaseDownloadUrl(
      bucket.name,
      objectPath,
      token
    );

    const now = new Date().toISOString();

    const record = {
      name: filename,
      originalName: file.name,
      alt,
      url,
      storagePath: objectPath,
      contentType: file.type,
      size: file.size,
      source: "editorial-studio",
      createdAt: now,
      updatedAt: now,
    };

    await bayanDb()
      .collection(MEDIA_COLLECTION)
      .doc(id)
      .set(record);

    return NextResponse.json({
      ok: true,
      item: {
        id,
        ...record,
      },
    });
  } catch (error) {
    console.error("[editorial/media][POST]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          "تعذر رفع الصورة. تحقق من FIREBASE_STORAGE_BUCKET وصلاحيات Firebase Storage.",
      },
      { status: 500 }
    );
  }
}
