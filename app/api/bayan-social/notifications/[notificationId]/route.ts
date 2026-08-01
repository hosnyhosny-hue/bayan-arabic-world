import { markSocialNotificationRead, socialError, socialJson } from "@bayan/social/server";
type Context = { params: Promise<{ notificationId: string }> };
export async function PATCH(_: Request, context: Context) { try { const { notificationId } = await context.params; await markSocialNotificationRead(notificationId); return socialJson({ read: true }); } catch (error) { return socialError(error); } }
