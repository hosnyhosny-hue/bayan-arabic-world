import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { adminAuth, adminDb } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "bayan_admin_session";
const DOCUMENT_PATH = "siteSettings/heroVideo";

const defaults = {
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

async function getAdmin() {
  const store = await cookies();
  const session = store.get(COOKIE_NAME)?.value;

  if (!session) return null;

  try {
    return await adminAuth.verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401 }
  );
}

function text(value: unknown, maximum: number) {
  return typeof value === "string"
    ? value.trim().slice(0, maximum)
    : "";
}

function validUrl(value: string) {
  if (!value) return true;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

async function deleteStorageFile(path: string) {
  if (!path) return;

  try {
    await getStorage()
      .bucket()
      .file(path)
      .delete({ ignoreNotFound: true });
  } catch (error) {
    console.error(`Failed to delete storage file: ${path}`, error);
  }
}

export async function GET() {
  const user = await getAdmin();

  if (!user) return unauthorized();

  const snapshot = await adminDb.doc(DOCUMENT_PATH).get();

  return NextResponse.json({
    success: true,
    data: snapshot.exists
      ? { ...defaults, ...snapshot.data() }
      : defaults,
  });
}

export async function PUT(request: Request) {
  const user = await getAdmin();

  if (!user) return unauthorized();

  try {
    const body = await request.json();

    const videoUrl = text(body.videoUrl, 3000);
    const posterUrl = text(body.posterUrl, 3000);

    if (!validUrl(videoUrl) || !validUrl(posterUrl)) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب أن تستخدم روابط الوسائط بروتوكول HTTPS.",
        },
        { status: 400 }
      );
    }

    if (body.enabled && !videoUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "ارفع فيديو قبل تفعيل النشر.",
        },
        { status: 400 }
      );
    }

    const currentSnapshot = await adminDb.doc(DOCUMENT_PATH).get();
    const currentData = currentSnapshot.data() || {};

    const videoPath = text(body.videoPath, 1000);
    const posterPath = text(body.posterPath, 1000);

    if (
      currentData.videoPath &&
      videoPath &&
      currentData.videoPath !== videoPath
    ) {
      await deleteStorageFile(currentData.videoPath);
    }

    if (
      currentData.posterPath &&
      posterPath &&
      currentData.posterPath !== posterPath
    ) {
      await deleteStorageFile(currentData.posterPath);
    }

    const data = {
      enabled: Boolean(body.enabled),
      videoUrl,
      videoPath,
      posterUrl,
      posterPath,
      titleAr: text(body.titleAr, 140) || defaults.titleAr,
      titleEn: text(body.titleEn, 140) || defaults.titleEn,
      descriptionAr:
        text(body.descriptionAr, 500) || defaults.descriptionAr,
      descriptionEn:
        text(body.descriptionEn, 500) || defaults.descriptionEn,
      updatedBy: user.email || user.uid,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.doc(DOCUMENT_PATH).set(data, { merge: true });

    return NextResponse.json({
      success: true,
      message: "تم حفظ التعديلات بنجاح.",
      data,
    });
  } catch (error) {
    console.error("Hero video update error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "فشل حفظ التعديلات.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const user = await getAdmin();

  if (!user) return unauthorized();

  try {
    const reference = adminDb.doc(DOCUMENT_PATH);
    const snapshot = await reference.get();
    const data = snapshot.data();

    if (data?.videoPath) {
      await deleteStorageFile(data.videoPath);
    }

    if (data?.posterPath) {
      await deleteStorageFile(data.posterPath);
    }

    await reference.delete();

    return NextResponse.json({
      success: true,
      message: "تم حذف فيديو الشهر وجميع ملفاته بنجاح.",
      data: defaults,
    });
  } catch (error) {
    console.error("Hero video delete error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "فشل حذف فيديو الشهر.",
      },
      { status: 500 }
    );
  }
}
