import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";
import type { PulseContentDocument } from "@/packages/bayan-pulse-cms/src";

export const dynamic = "force-dynamic";

function serialize(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if ("toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (Array.isArray(value)) return value.map(serialize);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, serialize(item)])
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const channel = searchParams.get("channel");
    const limit = Math.max(1, Math.min(Number(searchParams.get("limit") || 100), 100));

    let query: FirebaseFirestore.Query = bayanDb().collection("bayan_pulse_content");
    if (locale) query = query.where("locale", "==", locale);
    if (status) query = query.where("status", "==", status);
    if (type) query = query.where("type", "==", type);
    if (channel) query = query.where("channel", "==", channel);
    query = query.orderBy("updatedAt", "desc").limit(limit);

    const snapshot = await query.get();
    return NextResponse.json({
      ok: true,
      items: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(serialize(doc.data()) as Record<string, unknown>),
      })),
    });
  } catch (error) {
    console.error("[Pulse CMS content GET]", error);
    return NextResponse.json({ ok: false, items: [], error: "Unable to load content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PulseContentDocument;
    const ref = body.id
      ? bayanDb().collection("bayan_pulse_content").doc(body.id)
      : bayanDb().collection("bayan_pulse_content").doc();

    const now = new Date();
    await ref.set({
      ...body,
      id: ref.id,
      createdAt: body.createdAt || now,
      updatedAt: now,
      publishedAt: body.status === "published" ? (body.publishedAt || now) : (body.publishedAt || null),
    }, { merge: true });

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (error) {
    console.error("[Pulse CMS content POST]", error);
    return NextResponse.json({ ok: false, error: "Unable to save content" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  await bayanDb().collection("bayan_pulse_content").doc(id).delete();
  return NextResponse.json({ ok: true });
}
