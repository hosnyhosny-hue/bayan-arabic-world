import { NextResponse } from "next/server";
import { apiError } from "@/core/bayan-core/http";
import { getCurrentBayanUser } from "@/core/bayan-core/auth-server";

export async function GET() {
  try {
    const user = await getCurrentBayanUser();
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return apiError(error);
  }
}
