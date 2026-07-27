import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/src/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
