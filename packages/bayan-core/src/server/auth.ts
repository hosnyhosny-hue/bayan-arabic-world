import { cookies, headers } from "next/headers";
import { bayanAuth, bayanDb } from "./admin";
import { hasPermission, permissionsForRole } from "../roles";
import type { BayanPermission, BayanRole, BayanUserProfile } from "../types";

export class BayanAuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function readToken(): Promise<string | null> {
  const headerStore = await headers();
  const authorization = headerStore.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7);

  const cookieStore = await cookies();
  return cookieStore.get("__session")?.value || cookieStore.get("bayan_session")?.value || null;
}

export async function getCurrentBayanUser(): Promise<BayanUserProfile | null> {
  const token = await readToken();
  if (!token) return null;

  let decoded;
  try {
    decoded = await bayanAuth().verifyIdToken(token);
  } catch {
    try {
      decoded = await bayanAuth().verifySessionCookie(token, true);
    } catch {
      return null;
    }
  }

  const snapshot = await bayanDb().collection("bayan_users").doc(decoded.uid).get();
  const stored = snapshot.data() as Partial<BayanUserProfile> | undefined;
  const role = (stored?.role || decoded.role || "parent") as BayanRole;

  return {
    uid: decoded.uid,
    email: stored?.email || decoded.email || "",
    displayName: stored?.displayName || decoded.name || decoded.email || "BAYAN User",
    photoURL: stored?.photoURL || decoded.picture,
    role,
    permissions: stored?.permissions || permissionsForRole(role),
    status: stored?.status || "active",
    locale: stored?.locale || "ar",
    schoolId: stored?.schoolId || process.env.BAYAN_DEFAULT_SCHOOL_ID || "kcd",
    familyId: stored?.familyId,
    studentIds: stored?.studentIds || [],
    createdAt: stored?.createdAt,
    updatedAt: stored?.updatedAt,
  };
}

export async function requireBayanPermission(permission: BayanPermission): Promise<BayanUserProfile> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanAuthError(401, "Authentication required");
  if (user.status === "suspended") throw new BayanAuthError(403, "Account suspended");
  if (!hasPermission(user.role, permission, user.permissions || [])) {
    throw new BayanAuthError(403, `Missing permission: ${permission}`);
  }
  return user;
}
