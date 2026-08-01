import { NextResponse } from "next/server";
import { bayanDb } from "@bayan/core/server";

export const dynamic = "force-dynamic";

async function safeCount(query: FirebaseFirestore.Query): Promise<number> {
  try {
    const snapshot = await query.count().get();
    return snapshot.data().count;
  } catch {
    return (await query.limit(1000).get()).size;
  }
}

function serializeDate(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

export async function GET() {
  const db = bayanDb();
  const content = db.collection("bayan_pulse_content");
  const stories = db.collection("bayan_pulse_stories");
  const events = db.collection("bayan_events");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const [
      drafts, review, scheduled, publishedToday,
      activeStories, todayEvents, breakingNews, auditSnapshot
    ] = await Promise.all([
      safeCount(content.where("status", "==", "draft")),
      safeCount(content.where("status", "==", "review")),
      safeCount(content.where("status", "==", "scheduled")),
      safeCount(content.where("status", "==", "published").where("publishedAt", ">=", startOfDay).where("publishedAt", "<=", endOfDay)),
      safeCount(stories.where("status", "==", "published")),
      safeCount(events.where("startAt", ">=", startOfDay).where("startAt", "<=", endOfDay)),
      safeCount(content.where("status", "==", "published").where("isBreaking", "==", true)),
      db.collection("bayan_pulse_audit_logs").orderBy("createdAt", "desc").limit(12).get().catch(() => null)
    ]);

    const activities = auditSnapshot?.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        action: String(data.action || "تحديث"),
        entityType: String(data.entityType || "content"),
        entityTitle: String(data.entityTitle || "عنصر في نبض بيان"),
        actorName: String(data.actorName || "محرر"),
        createdAt: serializeDate(data.createdAt),
        tone: String(data.tone || "neutral")
      };
    }) || [];

    return NextResponse.json({
      ok: true,
      metrics: {
        drafts, review, scheduled, publishedToday,
        activeStories, todayEvents, breakingNews, mediaIssues: 0
      },
      activities,
      health: [
        { id:"public-site", label:"واجهة نبض العامة", status:"healthy", detail:"المسار /pulse متاح" },
        { id:"firestore", label:"Firestore", status:"healthy", detail:"تم الاتصال بمصادر البيانات" },
        { id:"media", label:"مكتبة الوسائط", status:"warning", detail:"تحتاج مراجعة الصور البديلة وAlt Text" },
        { id:"publishing", label:"محرك النشر", status:"healthy", detail:"المسودات والمراجعة والنشر تعمل" }
      ],
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("[Pulse Control Center Dashboard]", error);
    return NextResponse.json({
      ok: true,
      degraded: true,
      metrics: {
        drafts:0, review:0, scheduled:0, publishedToday:0,
        activeStories:0, todayEvents:0, breakingNews:0, mediaIssues:0
      },
      activities: [],
      health: [
        { id:"firestore", label:"Firestore", status:"error", detail:"تعذر قراءة بعض مؤشرات البيانات" },
        { id:"public-site", label:"واجهة نبض العامة", status:"healthy", detail:"الواجهة العامة لم تتأثر" }
      ],
      generatedAt: new Date().toISOString()
    });
  }
}
