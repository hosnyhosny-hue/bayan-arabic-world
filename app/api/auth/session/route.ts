import { NextResponse } from "next/server";
import { adminAuth } from "@/src/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/src/lib/admin-auth";

export const runtime = "nodejs";

const FIVE_DAYS = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { idToken?: string };
    const idToken = body.idToken;

    if (!idToken) {
      return NextResponse.json(
        { error: "رمز تسجيل الدخول غير موجود." },
        { status: 400 },
      );
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const permittedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (
      !decoded.email ||
      !permittedEmail ||
      decoded.email.toLowerCase() !== permittedEmail
    ) {
      return NextResponse.json(
        { error: "هذا الحساب غير مخوّل للدخول إلى الإدارة." },
        { status: 403 },
      );
    }

    // لا نقبل رمزًا قديمًا تم إنشاؤه قبل أكثر من خمس دقائق.
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds - decoded.auth_time > 5 * 60) {
      return NextResponse.json(
        { error: "أعد تسجيل الدخول ثم حاول مرة أخرى." },
        { status: 401 },
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: FIVE_DAYS,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAge: FIVE_DAYS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session creation failed:", error);

    return NextResponse.json(
      { error: "تعذر إنشاء جلسة الدخول. تحقق من البيانات." },
      { status: 401 },
    );
  }
}
