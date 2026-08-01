import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "ar";
  const ref = bayanDb().collection("bayan_pulse_editions").doc(`edition-${locale}`);
  const doc = await ref.get();
  return NextResponse.json({ ok: true, edition: doc.exists ? { id: doc.id, ...doc.data() } : null });
}

export async function POST(request: Request) {
  const body = await request.json() as {
    locale: "ar" | "en";
    leadContentId?: string;
    sideContentIds?: string[];
    featureContentIds?: string[];
  };
  const id = `edition-${body.locale}`;
  await bayanDb().collection("bayan_pulse_editions").doc(id).set({ ...body, id, updatedAt: new Date() }, { merge: true });
  return NextResponse.json({ ok: true, id });
}
