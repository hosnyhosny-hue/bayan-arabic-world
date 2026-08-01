import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BayanAuthError } from "./auth-server";

export function apiError(error: unknown) {
  if (error instanceof BayanAuthError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ success: false, error: "Validation failed", details: error.flatten() }, { status: 400 });
  }
  console.error("BAYAN Core API error", error);
  return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
}
