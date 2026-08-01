import { deleteSocialPost, getSocialPost, socialError, socialJson, updateSocialPost } from "@bayan/social/server";
type Context = { params: Promise<{ postId: string }> };
export async function GET(_: Request, context: Context) { try { const { postId } = await context.params; return socialJson(await getSocialPost(postId)); } catch (error) { return socialError(error); } }
export async function PATCH(request: Request, context: Context) { try { const { postId } = await context.params; return socialJson(await updateSocialPost(postId, await request.json())); } catch (error) { return socialError(error); } }
export async function DELETE(_: Request, context: Context) { try { const { postId } = await context.params; await deleteSocialPost(postId); return socialJson({ deleted: true }); } catch (error) { return socialError(error); } }
