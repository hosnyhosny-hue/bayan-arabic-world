import { bayanDb, getCurrentBayanUser } from "@bayan/core/server";
import { reactionSchema } from "../schemas";
import { BayanSocialError } from "./errors";
import { FieldValue, nowIso, socialCollections } from "./helpers";

export async function toggleSocialReaction(input: unknown): Promise<{ active: boolean }> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  const parsed = reactionSchema.parse(input);
  const postRef = bayanDb().collection(socialCollections.posts).doc(parsed.postId);
  const reactionId = `${parsed.postId}_${user.uid}`;
  const reactionRef = bayanDb().collection(socialCollections.reactions).doc(reactionId);
  return bayanDb().runTransaction(async (tx) => {
    const [postSnapshot, reactionSnapshot] = await Promise.all([tx.get(postRef), tx.get(reactionRef)]);
    if (!postSnapshot.exists) throw new BayanSocialError(404, "Post not found");
    const post = postSnapshot.data() || {};
    if (post.schoolId !== user.schoolId || post.status !== "published") throw new BayanSocialError(403, "Post unavailable");
    const existing = reactionSnapshot.data() as { reaction?: string } | undefined;
    if (existing?.reaction === parsed.reaction) {
      tx.delete(reactionRef);
      tx.update(postRef, { [`reactionCounts.${parsed.reaction}`]: FieldValue.increment(-1), updatedAt: nowIso() });
      return { active: false };
    }
    if (existing?.reaction) {
      tx.update(postRef, {
        [`reactionCounts.${existing.reaction}`]: FieldValue.increment(-1),
        [`reactionCounts.${parsed.reaction}`]: FieldValue.increment(1),
        updatedAt: nowIso(),
      });
    } else {
      tx.update(postRef, { [`reactionCounts.${parsed.reaction}`]: FieldValue.increment(1), updatedAt: nowIso() });
    }
    tx.set(reactionRef, { postId: parsed.postId, userId: user.uid, schoolId: user.schoolId, reaction: parsed.reaction, updatedAt: nowIso() });
    return { active: true };
  });
}
