import { deleteSocialComment, socialError, socialJson } from "@bayan/social/server";
type Context = { params: Promise<{ commentId: string }> };
export async function DELETE(_: Request, context: Context) { try { const { commentId } = await context.params; await deleteSocialComment(commentId); return socialJson({ deleted: true }); } catch (error) { return socialError(error); } }
