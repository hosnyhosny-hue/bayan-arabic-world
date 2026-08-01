import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { bayanAuth, bayanDb } from "@/core/bayan-core/admin";
import { requireBayanPermission } from "@/core/bayan-core/auth-server";
import { apiError } from "@/core/bayan-core/http";
import { permissionsForRole } from "@/core/bayan-core/rbac";
import { createUserSchema } from "@/core/bayan-core/schemas";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireBayanPermission("users.read");
    const search = request.nextUrl.searchParams.get("q")?.toLowerCase() || "";
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") || 50), 100);
    const snapshot = await bayanDb().collection("bayan_users")
      .where("schoolId", "==", actor.schoolId)
      .limit(limit)
      .get();
    const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))
      .filter((user: any) => !search || `${user.displayName} ${user.email}`.toLowerCase().includes(search));
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireBayanPermission("users.create");
    const payload = createUserSchema.parse(await request.json());
    if (payload.schoolId !== actor.schoolId && actor.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Cross-school creation is not allowed" }, { status: 403 });
    }

    const created = await bayanAuth().createUser({
      email: payload.email,
      password: payload.password,
      displayName: payload.displayName,
      emailVerified: false,
      disabled: false,
    });
    await bayanAuth().setCustomUserClaims(created.uid, { role: payload.role, schoolId: payload.schoolId });

    const record = {
      email: payload.email,
      displayName: payload.displayName,
      role: payload.role,
      permissions: permissionsForRole(payload.role),
      status: payload.password ? "active" : "invited",
      locale: payload.locale,
      schoolId: payload.schoolId,
      familyId: payload.familyId || null,
      studentIds: payload.studentIds,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: actor.uid,
    };
    await bayanDb().collection("bayan_users").doc(created.uid).set(record);
    return NextResponse.json({ success: true, data: { uid: created.uid, ...record } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
