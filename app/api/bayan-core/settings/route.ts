import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { bayanDb } from "@bayan/core/server";
import { requireBayanPermission } from "@bayan/core/server";
import { apiError } from "@bayan/core/server";
import { settingsSchema } from "@bayan/core/schemas";

const defaults = {
  schoolNameAr: "قسم اللغة العربية",
  schoolNameEn: "Arabic Department",
  defaultLocale: "ar",
  allowParentComments: true,
  requireCommentModeration: true,
  maxUploadMb: 100,
  allowedMediaTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "audio/mpeg", "application/pdf"],
  brand: { primary: "#0F6B4F", secondary: "#F28C28", logoUrl: "" },
};

export async function GET() {
  try {
    const actor = await requireBayanPermission("settings.read");
    const snapshot = await bayanDb().collection("bayan_settings").doc(actor.schoolId).get();
    return NextResponse.json({ success: true, data: { schoolId: actor.schoolId, ...defaults, ...(snapshot.data() || {}) } });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const actor = await requireBayanPermission("settings.update");
    const payload = settingsSchema.parse(await request.json());
    const update = { ...payload, schoolId: actor.schoolId, updatedAt: FieldValue.serverTimestamp(), updatedBy: actor.uid };
    await bayanDb().collection("bayan_settings").doc(actor.schoolId).set(update, { merge: true });
    return NextResponse.json({ success: true, data: update });
  } catch (error) {
    return apiError(error);
  }
}
