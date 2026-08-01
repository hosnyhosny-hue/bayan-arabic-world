import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/src/lib/firebase-admin";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

const allowedCollections = new Set(Object.values(CMS_COLLECTIONS));

const PULSE_COLLECTION = "bayan_pulse_content";
const PULSE_SOURCE = "cms_news";

type CmsRecord = Record<string, unknown>;

function validCollection(value: string | null): value is string {
  return Boolean(value && allowedCollections.has(value as never));
}

function textValue(
  data: CmsRecord,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = data[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function booleanValue(
  data: CmsRecord,
  keys: string[]
): boolean {
  return keys.some((key) => data[key] === true);
}

function pulseDocumentId(cmsNewsId: string): string {
  return `cms-news-${cmsNewsId}`;
}

function resolvePulseStatus(data: CmsRecord): string {
  const rawStatus = textValue(data, [
    "status",
    "publicationStatus",
    "publishStatus",
  ]).toLowerCase();

  if (
    rawStatus === "published" ||
    rawStatus === "active" ||
    rawStatus === "live" ||
    booleanValue(data, [
      "published",
      "isPublished",
      "active",
      "isActive",
    ])
  ) {
    return "published";
  }

  if (
    rawStatus === "scheduled" ||
    rawStatus === "review" ||
    rawStatus === "archived"
  ) {
    return rawStatus;
  }

  return "draft";
}

function createPulseRecord(
  data: CmsRecord,
  sourceId: string,
  includeCreatedAt: boolean
): CmsRecord {
  const status = resolvePulseStatus(data);

  const title = textValue(
    data,
    ["titleAr", "title", "nameAr", "name"],
    "خبر جديد"
  );

  const excerpt = textValue(data, [
    "excerptAr",
    "excerpt",
    "summaryAr",
    "summary",
    "descriptionAr",
    "description",
    "subtitleAr",
    "subtitle",
  ]);

  const body = textValue(
    data,
    [
      "contentAr",
      "content",
      "bodyAr",
      "body",
      "descriptionAr",
      "description",
    ],
    excerpt
  );

  const coverUrl = textValue(data, [
    "coverUrl",
    "imageUrl",
    "mediaUrl",
    "thumbnailUrl",
    "image",
    "coverImage",
  ]);

  const authorName = textValue(
    data,
    ["authorName", "author", "createdByName"],
    "قسم اللغة العربية"
  );

  const titleEn = textValue(data, [
    "titleEn",
    "englishTitle",
  ]);

  const excerptEn = textValue(data, [
    "excerptEn",
    "summaryEn",
    "descriptionEn",
  ]);

  const timestamp = FieldValue.serverTimestamp();

  return {
    locale: "ar",
    type: "news",
    channel: "school-news",
    status,

    title,
    excerpt,
    body,
    coverUrl,
    authorName,

    titleEn,
    excerptEn,

    isFeatured: booleanValue(data, [
      "isFeatured",
      "featured",
    ]),

    isBreaking: booleanValue(data, [
      "isBreaking",
      "breaking",
      "breakingNews",
    ]),

    isLive: booleanValue(data, [
      "isLive",
      "live",
    ]),

    source: PULSE_SOURCE,
    sourceId,
    cmsCollection: CMS_COLLECTIONS.news,

    publishedAt:
      status === "published"
        ? timestamp
        : null,

    updatedAt: timestamp,

    ...(includeCreatedAt
      ? {
          createdAt: timestamp,
        }
      : {}),
  };
}

async function getMergedCmsData(
  collectionName: string,
  id: string,
  update: CmsRecord
): Promise<CmsRecord> {
  const existing = await adminDb
    .collection(collectionName)
    .doc(id)
    .get();

  return {
    ...(existing.exists
      ? existing.data()
      : {}),
    ...update,
  };
}

export async function GET(request: NextRequest) {
  try {
    const collectionName =
      request.nextUrl.searchParams.get("collection");

    if (!validCollection(collectionName)) {
      return NextResponse.json(
        { error: "Invalid collection" },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection(collectionName)
      .orderBy("updatedAt", "desc")
      .limit(100)
      .get();

    return NextResponse.json({
      items: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    });
  } catch (error) {
    console.error("[CMS documents GET]", error);

    return NextResponse.json(
      { error: "Unable to load records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collectionName = body.collection;
    const data = body.data as CmsRecord;

    if (!validCollection(collectionName) || !data) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const cmsRef = adminDb
      .collection(collectionName)
      .doc();

    const activityRef = adminDb
      .collection(CMS_COLLECTIONS.activity)
      .doc();

    const batch = adminDb.batch();

    batch.set(cmsRef, {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.set(activityRef, {
      action: "create",
      collection: collectionName,
      recordId: cmsRef.id,
      title:
        textValue(
          data,
          ["titleAr", "title", "name"],
          "Record"
        ),
      createdAt: FieldValue.serverTimestamp(),
    });

    if (collectionName === CMS_COLLECTIONS.news) {
      const pulseRef = adminDb
        .collection(PULSE_COLLECTION)
        .doc(pulseDocumentId(cmsRef.id));

      batch.set(
        pulseRef,
        createPulseRecord(data, cmsRef.id, true),
        { merge: true }
      );
    }

    await batch.commit();

    return NextResponse.json(
      {
        id: cmsRef.id,
        pulseSynced:
          collectionName === CMS_COLLECTIONS.news,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CMS documents POST]", error);

    return NextResponse.json(
      { error: "Unable to create record" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      collection: collectionName,
      id,
      data,
    } = body as {
      collection: string;
      id: string;
      data: CmsRecord;
    };

    if (
      !validCollection(collectionName) ||
      !id ||
      !data
    ) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const mergedData =
      collectionName === CMS_COLLECTIONS.news
        ? await getMergedCmsData(
            collectionName,
            id,
            data
          )
        : data;

    const cmsRef = adminDb
      .collection(collectionName)
      .doc(id);

    const activityRef = adminDb
      .collection(CMS_COLLECTIONS.activity)
      .doc();

    const batch = adminDb.batch();

    batch.update(cmsRef, {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.set(activityRef, {
      action: "update",
      collection: collectionName,
      recordId: id,
      title:
        textValue(
          mergedData,
          ["titleAr", "title", "name"],
          "Record"
        ),
      createdAt: FieldValue.serverTimestamp(),
    });

    if (collectionName === CMS_COLLECTIONS.news) {
      const pulseRef = adminDb
        .collection(PULSE_COLLECTION)
        .doc(pulseDocumentId(id));

      batch.set(
        pulseRef,
        createPulseRecord(
          mergedData,
          id,
          false
        ),
        { merge: true }
      );
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      pulseSynced:
        collectionName === CMS_COLLECTIONS.news,
    });
  } catch (error) {
    console.error("[CMS documents PATCH]", error);

    return NextResponse.json(
      { error: "Unable to update record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      collection: collectionName,
      id,
    } = body as {
      collection: string;
      id: string;
    };

    if (!validCollection(collectionName) || !id) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const batch = adminDb.batch();

    const cmsRef = adminDb
      .collection(collectionName)
      .doc(id);

    batch.delete(cmsRef);

    const activityRef = adminDb
      .collection(CMS_COLLECTIONS.activity)
      .doc();

    batch.set(activityRef, {
      action: "delete",
      collection: collectionName,
      recordId: id,
      createdAt: FieldValue.serverTimestamp(),
    });

    if (collectionName === CMS_COLLECTIONS.news) {
      const pulseRef = adminDb
        .collection(PULSE_COLLECTION)
        .doc(pulseDocumentId(id));

      batch.delete(pulseRef);
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      pulseDeleted:
        collectionName === CMS_COLLECTIONS.news,
    });
  } catch (error) {
    console.error("[CMS documents DELETE]", error);

    return NextResponse.json(
      { error: "Unable to delete record" },
      { status: 500 }
    );
  }
}
