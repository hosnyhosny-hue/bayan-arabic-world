import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const start = new Date(now); start.setHours(0,0,0,0);
    const end = new Date(now); end.setHours(23,59,59,999);

    const snapshot = await bayanDb().collection("bayan_events")
      .where("startAt", ">=", start).where("startAt", "<=", end)
      .orderBy("startAt", "asc").limit(8).get();

    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      const date = data.startAt?.toDate?.() || new Date(data.startAt || Date.now());
      const isNow = Math.abs(date.getTime() - Date.now()) < 60 * 60 * 1000;
      return {
        id: doc.id,
        time: date.toLocaleTimeString("ar-QA", { hour: "2-digit", minute: "2-digit", hour12: false }),
        title: String(data.title || "فعالية بيان"),
        place: String(data.location || data.place || "داخل المدرسة"),
        status: isNow ? "مباشر" : "اليوم",
        isNow,
      };
    });
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: true, items: [] });
  }
}
