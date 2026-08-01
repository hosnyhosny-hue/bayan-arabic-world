import { bayanDb, getCurrentBayanUser } from "@bayan/core/server";
import { moderationSchema } from "../schemas";
import { canModerateSocial } from "../permissions";
import { BayanSocialError } from "./errors";
import { FieldValue, nowIso, socialCollections } from "./helpers";

export async function moderateSocialEntity(input: unknown): Promise<void> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  if (!canModerateSocial(user)) throw new BayanSocialError(403, "Moderation permission required");
  const parsed = moderationSchema.parse(input);
  const collection = parsed.entityType === "post" ? socialCollections.posts : socialCollections.comments;
  const ref = bayanDb().collection(collection).doc(parsed.entityId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new BayanSocialError(404, "Entity not found");
  const data = snapshot.data() || {};
  if (data.schoolId !== user.schoolId) throw new BayanSocialError(403, "Forbidden");
  const status = parsed.action === "approve" ? "published" : parsed.action === "reject" ? "rejected" : "archived";
  const patch: Record<string, unknown> = {
    status,
    updatedAt: nowIso(),
    moderation: { reviewedBy: user.uid, reviewedAt: nowIso(), rejectionReason: parsed.reason || null },
  };
  if (parsed.entityType === "post" && status === "published") patch.publishedAt = data.publishedAt || nowIso();
  await bayanDb().runTransaction(async (tx) => {
    tx.update(ref, patch);
    if (parsed.entityType === "comment" && status === "published" && data.status !== "published") {
      tx.update(bayanDb().collection(socialCollections.posts).doc(String(data.postId)), {
        commentsCount: FieldValue.increment(1), updatedAt: nowIso(),
      });
    }
  });
}
