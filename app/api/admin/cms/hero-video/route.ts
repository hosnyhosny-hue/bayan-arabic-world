import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
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

export async function GET() {
  const user = await getAdmin();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

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

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const videoUrl = text(body.videoUrl, 3000);
  const posterUrl = text(body.posterUrl, 3000);

  if (!validUrl(videoUrl) || !validUrl(posterUrl)) {
    return NextResponse.json(
      { success: false, message: "Media URLs must use HTTPS." },
      { status: 400 }
    );
  }

  if (body.enabled && !videoUrl) {
    return NextResponse.json(
      { success: false, message: "Upload a video before publishing." },
      { status: 400 }
    );
  }

  const data = {
    enabled: Boolean(body.enabled),
    videoUrl,
    videoPath: text(body.videoPath, 1000),
    posterUrl,
    posterPath: text(body.posterPath, 1000),
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

  return NextResponse.json({ success: true, data });
}
