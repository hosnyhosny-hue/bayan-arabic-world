import { NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await adminDb
      .doc("siteSettings/heroVideo")
      .get();

    const data = snapshot.data();

    if (!snapshot.exists || !data?.enabled || !data?.videoUrl) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        enabled: true,
        videoUrl: data.videoUrl,
        posterUrl: data.posterUrl || "",
        titleAr: data.titleAr || "نافذة بيان",
        titleEn: data.titleEn || "Bayan Spotlight",
        descriptionAr:
          data.descriptionAr ||
          "فيلم قسم اللغة العربية لهذا الشهر",
        descriptionEn:
          data.descriptionEn ||
          "Arabic Department Film of the Month",
      },
    });
  } catch (error) {
    console.error("Hero video API error:", error);

    return NextResponse.json(
      { success: false, data: null },
      { status: 500 }
    );
  }
}
