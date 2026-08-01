import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { bayanAuth, bayanDb } from "@bayan/core/server";
import { requireBayanPermission } from "@bayan/core/server";
import { apiError } from "@bayan/core/server";
import { permissionsForRole } from "@bayan/core/roles";
import { updateUserSchema } from "@bayan/core/schemas";

export async function PATCH(request: NextRequest, context: { params: Promise<{ uid: string }> }) {
  try {
    const actor = await requireBayanPermission("users.update");
    const { uid } = await context.params;
    const payload = updateUserSchema.parse(await request.json());
    const target = await bayanDb().collection("bayan_users").doc(uid).get();
    if (!target.exists) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    if (target.data()?.schoolId !== actor.schoolId && actor.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Cross-school update is not allowed" }, { status: 403 });
    }

    if (payload.role) {
      await requireBayanPermission("roles.manage");
      await bayanAuth().setCustomUserClaims(uid, { role: payload.role, schoolId: target.data()?.schoolId });
    }
    if (payload.displayName) await bayanAuth().updateUser(uid, { displayName: payload.displayName });
    if (payload.status) await bayanAuth().updateUser(uid, { disabled: payload.status === "suspended" });

    const update = {
      ...payload,
      ...(payload.role ? { permissions: permissionsForRole(payload.role) } : {}),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };
    await target.ref.update(update);
    return NextResponse.json({ success: true, data: { uid, ...update } });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ uid: string }> }) {
  try {
    const actor = await requireBayanPermission("users.delete");
    const { uid } = await context.params;
    if (uid === actor.uid) return NextResponse.json({ success: false, error: "You cannot delete your own account" }, { status: 400 });
    const ref = bayanDb().collection("bayan_users").doc(uid);
    const target = await ref.get();
    if (!target.exists) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    if (target.data()?.schoolId !== actor.schoolId && actor.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Cross-school deletion is not allowed" }, { status: 403 });
    }
    await bayanAuth().deleteUser(uid);
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
