import { moderateSocialEntity, socialError, socialJson } from "@bayan/social/server";
export async function POST(request: Request) { try { await moderateSocialEntity(await request.json()); return socialJson({ moderated: true }); } catch (error) { return socialError(error); } }
