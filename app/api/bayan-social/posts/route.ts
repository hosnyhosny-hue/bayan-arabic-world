import { createSocialPost, listSocialFeed, socialError, socialJson } from "@bayan/social/server";
export async function GET() { try { return socialJson(await listSocialFeed()); } catch (error) { return socialError(error); } }
export async function POST(request: Request) { try { return socialJson(await createSocialPost(await request.json()), 201); } catch (error) { return socialError(error); } }
