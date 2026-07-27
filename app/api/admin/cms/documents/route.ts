import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/src/lib/firebase-admin";
import { CMS_COLLECTIONS } from "@/src/lib/cms/collections";

const allowedCollections = new Set(Object.values(CMS_COLLECTIONS));

function validCollection(value: string | null): value is string {
  return Boolean(value && allowedCollections.has(value as never));
}

export async function GET(request: NextRequest) {
  try {
    const collectionName = request.nextUrl.searchParams.get("collection");

    if (!validCollection(collectionName)) {
      return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection(collectionName)
      .orderBy("updatedAt", "desc")
      .limit(100)
      .get();

    return NextResponse.json({
      items: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collectionName = body.collection;
    const data = body.data;

    if (!validCollection(collectionName) || !data) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const record = {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const ref = await adminDb.collection(collectionName).add(record);

    await adminDb.collection(CMS_COLLECTIONS.activity).add({
      action: "create",
      collection: collectionName,
      recordId: ref.id,
      title: data.titleAr || data.name || "Record",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create record" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection: collectionName, id, data } = body;

    if (!validCollection(collectionName) || !id || !data) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await adminDb.collection(collectionName).doc(id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection(CMS_COLLECTIONS.activity).add({
      action: "update",
      collection: collectionName,
      recordId: id,
      title: data.titleAr || data.name || "Record",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update record" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection: collectionName, id } = body;

    if (!validCollection(collectionName) || !id) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await adminDb.collection(collectionName).doc(id).delete();

    await adminDb.collection(CMS_COLLECTIONS.activity).add({
      action: "delete",
      collection: collectionName,
      recordId: id,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete record" }, { status: 500 });
  }
}
