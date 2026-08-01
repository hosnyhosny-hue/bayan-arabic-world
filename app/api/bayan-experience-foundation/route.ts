import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";
import type { ExperienceFoundationDocument } from "@/packages/bayan-experience-foundation/src";

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
    const slug = searchParams.get("slug") || "parents";
    const status = searchParams.get("status");

    let query: FirebaseFirestore.Query = bayanDb()
      .collection("bayan_experience_foundations")
      .where("slug", "==", slug);

    if (status) query = query.where("status", "==", status);

    const snapshot = await query.limit(20).get();
    const items: Array<Record<string, unknown>> = snapshot.docs.map((doc) => {
      const data = serialize(doc.data()) as Record<string, unknown>;
      return { id: doc.id, ...data };
    });

    items.sort((a, b) => Number(b["version"] ?? 0) - Number(a["version"] ?? 0));

    return NextResponse.json({ ok: true, experience: items[0] || null, items });
  } catch (error) {
    console.error("[Experience Foundation GET]", error);
    return NextResponse.json({ ok: true, experience: null, items: [], degraded: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ExperienceFoundationDocument;
    const id = body.id || bayanDb().collection("bayan_experience_foundations").doc().id;
    const now = new Date();

    await bayanDb().collection("bayan_experience_foundations").doc(id).set({
      ...body,
      id,
      updatedAt: now,
      publishedAt: body.status === "published" ? now : body.publishedAt || null,
    }, { merge: true });

    if (body.status === "published") {
      const snapshot = await bayanDb()
        .collection("bayan_experience_foundations")
        .where("slug", "==", body.slug)
        .where("status", "==", "published")
        .get();

      const batch = bayanDb().batch();
      snapshot.docs.forEach((doc) => {
        if (doc.id !== id) {
          batch.set(doc.ref, { status: "archived", updatedAt: now }, { merge: true });
        }
      });
      await batch.commit();
    }

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("[Experience Foundation POST]", error);
    return NextResponse.json({ ok: false, error: "Unable to save experience foundation" }, { status: 500 });
  }
}
