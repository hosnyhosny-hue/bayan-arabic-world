import { NextResponse } from "next/server";
import { getAdminUser } from "@/src/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAdminUser();

  if (!user) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    email: user.email,
  });
}
