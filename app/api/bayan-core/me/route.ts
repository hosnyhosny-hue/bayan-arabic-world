import { NextResponse } from "next/server";
import { apiError } from "@bayan/core/server";
import { getCurrentBayanUser } from "@bayan/core/server";

export async function GET() {
  try {
    const user = await getCurrentBayanUser();
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return apiError(error);
  }
}
