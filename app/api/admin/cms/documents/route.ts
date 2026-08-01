import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/src/lib/firebase-admin";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";
import {
  BAYAN_CONTENT_COLLECTION,
  type BayanContentType,
  normalizeContentRecord,
} from "@/src/lib/cms2/content-model";

const allowedCollections = new Set(
  Object.values(CMS_COLLECTIONS),
);

type UnknownRecord = Record<string, unknown>;

interface StorageTarget {
  collection: string;
  type?: BayanContentType;
  isUnifiedContent: boolean;
}

function validCollection(
  value: string | null,
): value is string {
  return Boolean(
    value &&
      allowedCollections.has(value as never),
  );
}

/**
 * يحافظ هذا المحول على واجهة CmsManager الحالية.
 *
 * الواجهة ما زالت ترسل:
 * cms_news / cms_events
 *
 * لكن طبقة API تحفظ فعليًا في:
 * bayan_pulse_content
 */
function resolveStorageTarget(
  collectionName: string,
): StorageTarget {
  if (collectionName === CMS_COLLECTIONS.news) {
    return {
      collection: BAYAN_CONTENT_COLLECTION,
      type: "news",
      isUnifiedContent: true,
    };
  }

  if (collectionName === CMS_COLLECTIONS.events) {
    return {
      collection: BAYAN_CONTENT_COLLECTION,
      type: "event",
      isUnifiedContent: true,
    };
  }

  if (
    "magazines" in CMS_COLLECTIONS &&
    collectionName === CMS_COLLECTIONS.magazines
  ) {
    return {
      collection: BAYAN_CONTENT_COLLECTION,
      type: "article",
      isUnifiedContent: true,
    };
  }

  if (
    "resources" in CMS_COLLECTIONS &&
    collectionName === CMS_COLLECTIONS.resources
  ) {
    return {
      collection: BAYAN_CONTENT_COLLECTION,
      type: "resource",
      isUnifiedContent: true,
    };
  }

  if (
    "students" in CMS_COLLECTIONS &&
    collectionName === CMS_COLLECTIONS.students
  ) {
    return {
      collection: BAYAN_CONTENT_COLLECTION,
      type: "student-work",
      isUnifiedContent: true,
    };
  }

  return {
    collection: collectionName,
    isUnifiedContent: false,
  };
}

function serializeDocument(
  id: string,
  data: FirebaseFirestore.DocumentData,
) {
  return {
    id,
    ...data,
  };
}

function sortByUpdatedAt(
  items: Array<Record<string, unknown>>,
) {
  return items.sort((a, b) => {
    const readMillis = (value: unknown): number => {
      if (
        value &&
        typeof value === "object" &&
        "toMillis" in value &&
        typeof (
          value as { toMillis?: unknown }
        ).toMillis === "function"
      ) {
        return (
          value as { toMillis: () => number }
        ).toMillis();
      }

      if (value instanceof Date) {
        return value.getTime();
      }

      if (typeof value === "string") {
        return new Date(value).getTime() || 0;
      }

      return 0;
    };

    return (
      readMillis(b.updatedAt) -
      readMillis(a.updatedAt)
    );
  });
}

export async function GET(
  request: NextRequest,
) {
  try {
    const collectionName =
      request.nextUrl.searchParams.get(
        "collection",
      );

    if (!validCollection(collectionName)) {
      return NextResponse.json(
        { error: "Invalid collection" },
        { status: 400 },
      );
    }

    const target =
      resolveStorageTarget(collectionName);

    if (
      target.isUnifiedContent &&
      target.type
    ) {
      /*
       * لا نستخدم orderBy مع where هنا لتجنب الحاجة
       * إلى Firestore composite index أثناء الانتقال.
       */
      const snapshot = await adminDb
        .collection(target.collection)
        .where("type", "==", target.type)
        .limit(300)
        .get();

      const items = sortByUpdatedAt(
        snapshot.docs.map((doc) =>
          serializeDocument(
            doc.id,
            doc.data(),
          ),
        ),
      ).slice(0, 100);

      return NextResponse.json({
        items,
        source: BAYAN_CONTENT_COLLECTION,
        contentType: target.type,
      });
    }

    const snapshot = await adminDb
      .collection(target.collection)
      .orderBy("updatedAt", "desc")
      .limit(100)
      .get();

    return NextResponse.json({
      items: snapshot.docs.map((doc) =>
        serializeDocument(
          doc.id,
          doc.data(),
        ),
      ),
    });
  } catch (error) {
    console.error(
      "[CMS 2.0 documents GET]",
      error,
    );

    return NextResponse.json(
      { error: "Unable to load records" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const collectionName =
      body.collection as string;

    const data = body.data as UnknownRecord;

    if (
      !validCollection(collectionName) ||
      !data
    ) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 },
      );
    }

    const target =
      resolveStorageTarget(collectionName);

    const documentRef = adminDb
      .collection(target.collection)
      .doc();

    const activityRef = adminDb
      .collection(CMS_COLLECTIONS.activity)
      .doc();

    const batch = adminDb.batch();

    if (
      target.isUnifiedContent &&
      target.type
    ) {
      batch.set(
        documentRef,
        normalizeContentRecord(data, {
          id: documentRef.id,
          type: target.type,
          legacyCollection:
            collectionName,
          includeCreatedAt: true,
        }),
      );
    } else {
      batch.set(documentRef, {
        ...data,
        createdAt:
          FieldValue.serverTimestamp(),
        updatedAt:
          FieldValue.serverTimestamp(),
      });
    }

    batch.set(activityRef, {
      action: "create",
      collection: collectionName,
      storageCollection:
        target.collection,
      contentType: target.type || null,
      recordId: documentRef.id,
      title:
        data.titleAr ||
        data.name ||
        "Record",
      createdAt:
        FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json(
      {
        id: documentRef.id,
        source: target.collection,
        contentType: target.type || null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "[CMS 2.0 documents POST]",
      error,
    );

    return NextResponse.json(
      { error: "Unable to create record" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const {
      collection: collectionName,
      id,
      data,
    } = body as {
      collection: string;
      id: string;
      data: UnknownRecord;
    };

    if (
      !validCollection(collectionName) ||
      !id ||
      !data
    ) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 },
      );
    }

    const target =
      resolveStorageTarget(collectionName);

    const documentRef = adminDb
      .collection(target.collection)
      .doc(id);

    const existing =
      await documentRef.get();

    if (!existing.exists) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 },
      );
    }

    const existingData =
      existing.data() || {};

    const mergedData = {
      ...existingData,
      ...data,
    };

    const activityRef = adminDb
      .collection(CMS_COLLECTIONS.activity)
      .doc();

    const batch = adminDb.batch();

    if (
      target.isUnifiedContent &&
      target.type
    ) {
      batch.set(
        documentRef,
        normalizeContentRecord(
          mergedData,
          {
            id,
            type: target.type,
            legacyCollection:
              collectionName,
            includeCreatedAt: false,
          },
        ),
        { merge: true },
      );
    } else {
      batch.update(documentRef, {
        ...data,
        updatedAt:
          FieldValue.serverTimestamp(),
      });
    }

    batch.set(activityRef, {
      action: "update",
      collection: collectionName,
      storageCollection:
        target.collection,
      contentType: target.type || null,
      recordId: id,
      title:
        data.titleAr ||
        existingData.titleAr ||
        data.name ||
        existingData.name ||
        "Record",
      createdAt:
        FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      source: target.collection,
      contentType: target.type || null,
    });
  } catch (error) {
    console.error(
      "[CMS 2.0 documents PATCH]",
      error,
    );

    return NextResponse.json(
      { error: "Unable to update record" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const {
      collection: collectionName,
      id,
    } = body as {
      collection: string;
      id: string;
    };

    if (
      !validCollection(collectionName) ||
      !id
    ) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 },
      );
    }

    const target =
      resolveStorageTarget(collectionName);

    const documentRef = adminDb
      .collection(target.collection)
      .doc(id);

    const activityRef = adminDb
      .collection(CMS_COLLECTIONS.activity)
      .doc();

    const batch = adminDb.batch();

    batch.delete(documentRef);

    batch.set(activityRef, {
      action: "delete",
      collection: collectionName,
      storageCollection:
        target.collection,
      contentType: target.type || null,
      recordId: id,
      createdAt:
        FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      source: target.collection,
      contentType: target.type || null,
    });
  } catch (error) {
    console.error(
      "[CMS 2.0 documents DELETE]",
      error,
    );

    return NextResponse.json(
      { error: "Unable to delete record" },
      { status: 500 },
    );
  }
}
