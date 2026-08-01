import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";
import type { PulseHeroDocument } from "@/packages/bayan-pulse-cms/src";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "ar";
  const snapshot = await bayanDb().collection("bayan_pulse_heroes").where("locale", "==", locale).get();
  return NextResponse.json({ ok: true, items: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
}

export async function POST(request: Request) {
  const body = await request.json() as PulseHeroDocument;
  const id = body.id || `${body.locale}-${body.slot}`;
  await bayanDb().collection("bayan_pulse_heroes").doc(id).set({ ...body, id, updatedAt: new Date() }, { merge: true });
  return NextResponse.json({ ok: true, id });
}
