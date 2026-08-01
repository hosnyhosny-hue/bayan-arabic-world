import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BayanSocialError } from "./errors";

export function socialJson(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function socialError(error: unknown) {
  if (error instanceof BayanSocialError) return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ ok: false, error: "Invalid request", issues: error.issues }, { status: 400 });
  console.error("BAYAN Social error", error);
  return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
}
