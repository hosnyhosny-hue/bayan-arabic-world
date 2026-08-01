import { listSocialNotifications, socialError, socialJson } from "@bayan/social/server";
export async function GET(request: Request) { try { const limit = Number(new URL(request.url).searchParams.get("limit") || 30); return socialJson(await listSocialNotifications(limit)); } catch (error) { return socialError(error); } }
