import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { adminAuth } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "bayan_admin_session";

const allowedVideoTypes = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionCookie) return null;

  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

function safeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function POST(request: Request) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const fileValue = formData.get("file");
    const typeValue = formData.get("type");

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        { success: false, message: "لم يتم اختيار ملف." },
        { status: 400 }
      );
    }

    const type = typeValue === "poster" ? "poster" : "video";
    const allowedTypes =
      type === "video" ? allowedVideoTypes : allowedImageTypes;

    if (!allowedTypes.has(fileValue.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            type === "video"
              ? "نوع الفيديو غير مدعوم. استخدم MP4 أو WebM أو MOV."
              : "نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WebP.",
        },
        { status: 400 }
      );
    }

    const maximumSize =
      type === "video"
        ? 1024 * 1024 * 1024
        : 15 * 1024 * 1024;

    if (fileValue.size > maximumSize) {
      return NextResponse.json(
        {
          success: false,
          message:
            type === "video"
              ? "حجم الفيديو يتجاوز 1 جيجابايت."
              : "حجم الصورة يتجاوز 15 ميجابايت.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await fileValue.arrayBuffer());
    const token = randomUUID();

    const originalName =
      safeFileName(fileValue.name) ||
      `${type}-${Date.now()}`;

    const path =
      `cms/hero-video/${type}/` +
      `${Date.now()}-${originalName}`;

    const bucket = getStorage().bucket();
    const storageFile = bucket.file(path);

    await storageFile.save(buffer, {
      resumable: false,
      contentType: fileValue.type,
      metadata: {
        cacheControl: "public,max-age=31536000,immutable",
        metadata: {
          firebaseStorageDownloadTokens: token,
          uploadedBy: user.email || user.uid,
          section: "homepage-hero-video",
        },
      },
    });

    const encodedPath = encodeURIComponent(path);

    const url =
      `https://firebasestorage.googleapis.com/v0/b/` +
      `${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

    return NextResponse.json({
      success: true,
      data: {
        url,
        path,
        name: fileValue.name,
        size: fileValue.size,
        contentType: fileValue.type,
      },
    });
  } catch (error) {
    console.error("Hero video upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "فشل رفع الملف.",
      },
      { status: 500 }
    );
  }
}
