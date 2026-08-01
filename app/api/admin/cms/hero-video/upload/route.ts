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

type UploadRequest = {
  name?: unknown;
  contentType?: unknown;
  size?: unknown;
  type?: unknown;
};

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
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as UploadRequest;

    const uploadType =
      body.type === "poster" ? "poster" : "video";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const contentType =
      typeof body.contentType === "string"
        ? body.contentType.trim()
        : "";

    const size =
      typeof body.size === "number"
        ? body.size
        : Number(body.size);

    if (!name || !contentType || !Number.isFinite(size)) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الملف غير مكتملة.",
        },
        { status: 400 }
      );
    }

    const allowedTypes =
      uploadType === "video"
        ? allowedVideoTypes
        : allowedImageTypes;

    if (!allowedTypes.has(contentType)) {
      return NextResponse.json(
        {
          success: false,
          message:
            uploadType === "video"
              ? "نوع الفيديو غير مدعوم. استخدم MP4 أو WebM أو MOV."
              : "نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WebP.",
        },
        { status: 400 }
      );
    }

    const maximumSize =
      uploadType === "video"
        ? 1024 * 1024 * 1024
        : 15 * 1024 * 1024;

    if (size <= 0 || size > maximumSize) {
      return NextResponse.json(
        {
          success: false,
          message:
            uploadType === "video"
              ? "يجب ألا يتجاوز حجم الفيديو 1 جيجابايت."
              : "يجب ألا يتجاوز حجم الصورة 15 ميجابايت.",
        },
        { status: 400 }
      );
    }

    const token = randomUUID();

    const originalName =
      safeFileName(name) ||
      `${uploadType}-${Date.now()}`;

    const path =
      `cms/hero-video/${uploadType}/` +
      `${Date.now()}-${randomUUID()}-${originalName}`;

    const bucket = getStorage().bucket();
    const storageFile = bucket.file(path);

    const [uploadUrl] =
      await storageFile.createResumableUpload({
        metadata: {
          contentType,
          cacheControl:
            "public,max-age=31536000,immutable",
          metadata: {
            firebaseStorageDownloadTokens: token,
            uploadedBy: user.email || user.uid,
            section: "homepage-hero-video",
          },
        },
      });

    const encodedPath = encodeURIComponent(path);

    const downloadUrl =
      `https://firebasestorage.googleapis.com/v0/b/` +
      `${bucket.name}/o/${encodedPath}` +
      `?alt=media&token=${token}`;

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        downloadUrl,
        path,
        name,
        size,
        contentType,
      },
    });
  } catch (error) {
    console.error(
      "Hero video resumable upload error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "تعذر إنشاء رابط رفع الفيديو.",
      },
      { status: 500 }
    );
  }
}
