import { bayanDb, getCurrentBayanUser } from "@bayan/core/server";
import { createCommentSchema } from "../schemas";
import type { BayanSocialComment } from "../types";
import { canCommentSocial, canModerateSocial } from "../permissions";
import { BayanSocialError } from "./errors";
import { FieldValue, nowIso, socialCollections, toIso } from "./helpers";

function mapComment(id: string, data: Record<string, unknown>): BayanSocialComment {
  return { ...(data as unknown as BayanSocialComment), id, createdAt: toIso(data.createdAt) || nowIso(), updatedAt: toIso(data.updatedAt) || nowIso() };
}

export async function createSocialComment(input: unknown): Promise<BayanSocialComment> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  if (!canCommentSocial(user)) throw new BayanSocialError(403, "Comments are not allowed");
  const parsed = createCommentSchema.parse(input);
  const postRef = bayanDb().collection(socialCollections.posts).doc(parsed.postId);
  const postSnapshot = await postRef.get();
  if (!postSnapshot.exists) throw new BayanSocialError(404, "Post not found");
  const post = postSnapshot.data() || {};
  if (post.schoolId !== user.schoolId || post.status !== "published") throw new BayanSocialError(403, "Post unavailable");
  if (post.commentsEnabled === false) throw new BayanSocialError(403, "Comments are disabled");
  const status = user.role === "parent" || user.role === "student" ? "pending" : "published";
  const ref = bayanDb().collection(socialCollections.comments).doc();
  const instant = nowIso();
  const comment: BayanSocialComment = {
    id: ref.id,
    postId: parsed.postId,
    schoolId: user.schoolId,
    author: { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL, role: user.role },
    body: parsed.body,
    status,
    parentCommentId: parsed.parentCommentId,
    createdAt: instant,
    updatedAt: instant,
  };
  await bayanDb().runTransaction(async (tx) => {
    tx.set(ref, comment);
    if (status === "published") tx.update(postRef, { commentsCount: FieldValue.increment(1), updatedAt: instant });
  });
  return comment;
}

export async function listSocialComments(postId: string): Promise<BayanSocialComment[]> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  const snapshot = await bayanDb().collection(socialCollections.comments)
    .where("schoolId", "==", user.schoolId)
    .where("postId", "==", postId)
    .where("status", "==", "published")
    .orderBy("createdAt", "asc")
    .limit(250)
    .get();
  return snapshot.docs.map((doc) => mapComment(doc.id, doc.data()));
}

export async function deleteSocialComment(commentId: string): Promise<void> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  const ref = bayanDb().collection(socialCollections.comments).doc(commentId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new BayanSocialError(404, "Comment not found");
  const comment = mapComment(snapshot.id, snapshot.data() || {});
  if (comment.author.uid !== user.uid && !canModerateSocial(user)) throw new BayanSocialError(403, "Forbidden");
  await ref.update({ status: "deleted", updatedAt: nowIso() });
}
