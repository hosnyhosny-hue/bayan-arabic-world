import { socialError, socialJson, toggleSocialReaction } from "@bayan/social/server";
export async function POST(request: Request) { try { return socialJson(await toggleSocialReaction(await request.json())); } catch (error) { return socialError(error); } }
