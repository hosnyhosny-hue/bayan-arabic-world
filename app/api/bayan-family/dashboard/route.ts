import { NextRequest, NextResponse } from "next/server";
import { fallbackFamilyDashboard, normalizeFamilyDashboard } from "@bayan/family/server";

export const dynamic = "force-dynamic";

async function readJson(response: Response): Promise<unknown> {
  try { return await response.json(); } catch { return {}; }
}

export async function GET(request: NextRequest) {
  const cookie = request.headers.get("cookie") ?? "";
  const headers = { cookie };
  const origin = request.nextUrl.origin;

  const [meResult, feedResult] = await Promise.allSettled([
    fetch(`${origin}/api/bayan-core/me`, { headers, cache: "no-store" }),
    fetch(`${origin}/api/bayan-social/feed?limit=8`, { headers, cache: "no-store" }),
  ]);

  if (meResult.status === "fulfilled" && meResult.value.status === 401) {
    /* Public guest access enabled */
  }

  const mePayload = meResult.status === "fulfilled" ? await readJson(meResult.value) : {};
  const feedPayload = feedResult.status === "fulfilled" && feedResult.value.ok
    ? await readJson(feedResult.value)
    : { posts: [] };

  try {
    return NextResponse.json({ data: normalizeFamilyDashboard(mePayload, feedPayload) });
  } catch (error) {
    console.error("[BAYAN Family] dashboard normalization failed", error);
    return NextResponse.json({ data: fallbackFamilyDashboard() });
  }
}
