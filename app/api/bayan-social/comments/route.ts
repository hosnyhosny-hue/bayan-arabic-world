import { createSocialComment, listSocialComments, socialError, socialJson } from "@bayan/social/server";
export async function GET(request: Request) { try { const postId = new URL(request.url).searchParams.get("postId"); if (!postId) throw new Error("postId is required"); return socialJson(await listSocialComments(postId)); } catch (error) { return socialError(error); } }
export async function POST(request: Request) { try { return socialJson(await createSocialComment(await request.json()), 201); } catch (error) { return socialError(error); } }
