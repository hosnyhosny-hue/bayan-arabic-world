import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/src/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/src/lib/auth-constants";

export { SESSION_COOKIE_NAME };

export async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const permittedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (
      !decoded.email ||
      !permittedEmail ||
      decoded.email.toLowerCase() !== permittedEmail
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getAdminUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
