import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { bayanDb, bayanStorage } from "@/core/bayan-core/admin";
import { requireBayanPermission } from "@/core/bayan-core/auth-server";
import { apiError } from "@/core/bayan-core/http";

export const runtime = "nodejs";

function safeName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function GET(request: NextRequest) {
  try {
    const actor = await requireBayanPermission("media.read");
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") || 50), 100);
    const snapshot = await bayanDb().collection("bayan_media")
      .where("schoolId", "==", actor.schoolId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return NextResponse.json({ success: true, data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireBayanPermission("media.upload");
    const settings = await bayanDb().collection("bayan_settings").doc(actor.schoolId).get();
    const maxUploadMb = Number(settings.data()?.maxUploadMb || 100);
    const allowed = settings.data()?.allowedMediaTypes || ["image/jpeg", "image/png", "image/webp", "video/mp4", "audio/mpeg", "application/pdf"];

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ success: false, error: "file is required" }, { status: 400 });
    if (!allowed.includes(file.type)) return NextResponse.json({ success: false, error: `Unsupported media type: ${file.type}` }, { status: 415 });
    if (file.size > maxUploadMb * 1024 * 1024) return NextResponse.json({ success: false, error: `File exceeds ${maxUploadMb} MB` }, { status: 413 });

    const visibility = String(form.get("visibility") || "school");
    if (!["public", "school", "class", "private"].includes(visibility)) {
      return NextResponse.json({ success: false, error: "Invalid visibility" }, { status: 400 });
    }

    const id = randomUUID();
    const path = `bayan-core/${actor.schoolId}/${actor.uid}/${id}-${safeName(file.name)}`;
    const bucket = bayanStorage().bucket();
    const object = bucket.file(path);
    const token = randomUUID();
    await object.save(Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      resumable: false,
      metadata: { metadata: { firebaseStorageDownloadTokens: token, ownerId: actor.uid, schoolId: actor.schoolId } },
    });
    const encodedPath = encodeURIComponent(path);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
    const record = {
      ownerId: actor.uid,
      schoolId: actor.schoolId,
      path,
      url,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      visibility,
      createdAt: new Date().toISOString(),
      createdAtServer: FieldValue.serverTimestamp(),
    };
    await bayanDb().collection("bayan_media").doc(id).set(record);
    return NextResponse.json({ success: true, data: { id, ...record } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
