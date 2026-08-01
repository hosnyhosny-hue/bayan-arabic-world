import { bayanDb, getCurrentBayanUser } from "@bayan/core/server";
import type { BayanSocialNotification } from "../types";
import { BayanSocialError } from "./errors";
import { nowIso, socialCollections, toIso } from "./helpers";

export async function listSocialNotifications(limit = 30): Promise<BayanSocialNotification[]> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  const snapshot = await bayanDb().collection(socialCollections.notifications)
    .where("recipientId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .limit(Math.min(Math.max(limit, 1), 100))
    .get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return { ...(data as BayanSocialNotification), id: doc.id, createdAt: toIso(data.createdAt) || nowIso(), readAt: toIso(data.readAt) };
  });
}

export async function markSocialNotificationRead(notificationId: string): Promise<void> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  const ref = bayanDb().collection(socialCollections.notifications).doc(notificationId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new BayanSocialError(404, "Notification not found");
  if (snapshot.data()?.recipientId !== user.uid) throw new BayanSocialError(403, "Forbidden");
  await ref.update({ readAt: nowIso() });
}
