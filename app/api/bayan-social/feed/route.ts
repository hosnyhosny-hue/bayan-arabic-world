import { listSocialFeed, socialError, socialJson } from "@bayan/social/server";
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const result = await listSocialFeed({ limit: Number(url.searchParams.get("limit") || 20), cursor: url.searchParams.get("cursor") || undefined, includePending: url.searchParams.get("includePending") === "1" });
    return socialJson(result);
  } catch (error) { return socialError(error); }
}
