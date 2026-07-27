import { NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const collections = [
  ["pages", CMS_COLLECTIONS.pages],
  ["news", CMS_COLLECTIONS.news],
  ["events", CMS_COLLECTIONS.events],
  ["media", CMS_COLLECTIONS.media],
  ["team", CMS_COLLECTIONS.team],
  ["students", CMS_COLLECTIONS.students],
  ["magazines", CMS_COLLECTIONS.magazines],
  ["resources", CMS_COLLECTIONS.resources],
] as const;

export async function GET() {
  try {
    const entries = await Promise.all(
      collections.map(async ([key, collectionName]) => {
        const snapshot = await adminDb.collection(collectionName).count().get();

        return [
          key,
          snapshot.data().count,
        ] as const;
      })
    );

    const activitySnapshot = await adminDb
      .collection(CMS_COLLECTIONS.activity)
      .orderBy("createdAt", "desc")
      .limit(8)
      .get();

    return NextResponse.json({
      counts: Object.fromEntries(entries),
      activity: activitySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })),
    });
  } catch (error) {
    console.error("CMS stats error:", error);

    return NextResponse.json(
      {
        error: "Unable to load dashboard statistics.",
        counts: {},
        activity: [],
      },
      { status: 500 }
    );
  }
}
