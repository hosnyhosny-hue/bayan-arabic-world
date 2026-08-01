import { bayanDb, getCurrentBayanUser } from "@bayan/core/server";
import type { BayanUserProfile } from "@bayan/core/types";
import { createPostSchema, updatePostSchema } from "../schemas";
import type { BayanSocialFeedPage, BayanSocialPost } from "../types";
import { canCreateSocialPost, canEditSocialPost, canPublishSocialPost } from "../permissions";
import { BayanSocialError } from "./errors";
import { nowIso, socialCollections, toIso } from "./helpers";

function authorFrom(user: BayanUserProfile) {
  return { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL, role: user.role };
}

function mapPost(id: string, data: Record<string, unknown>): BayanSocialPost {
  return {
    ...(data as unknown as BayanSocialPost),
    id,
    createdAt: toIso(data.createdAt) || nowIso(),
    updatedAt: toIso(data.updatedAt) || nowIso(),
    publishedAt: toIso(data.publishedAt),
  };
}

export async function createSocialPost(input: unknown): Promise<BayanSocialPost> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  if (!canCreateSocialPost(user)) throw new BayanSocialError(403, "You cannot create posts");

  const parsed = createPostSchema.parse(input);
  const instant = nowIso();
  const status = parsed.submitForReview && !canPublishSocialPost(user) ? "pending" : "published";
  const ref = bayanDb().collection(socialCollections.posts).doc();
  const post: BayanSocialPost = {
    id: ref.id,
    schoolId: user.schoolId,
    author: authorFrom(user),
    type: parsed.type,
    status,
    visibility: parsed.visibility,
    audience: {
      schoolId: user.schoolId,
      yearGroups: parsed.yearGroups,
      classIds: parsed.classIds,
      familyIds: parsed.familyIds,
    },
    titleAr: parsed.titleAr,
    titleEn: parsed.titleEn,
    bodyAr: parsed.bodyAr,
    bodyEn: parsed.bodyEn,
    media: parsed.media,
    tags: parsed.tags,
    pinned: parsed.pinned,
    commentsEnabled: parsed.commentsEnabled,
    reactionCounts: {},
    commentsCount: 0,
    viewsCount: 0,
    publishedAt: status === "published" ? instant : undefined,
    createdAt: instant,
    updatedAt: instant,
  };
  await ref.set(post);
  return post;
}

export async function updateSocialPost(postId: string, input: unknown): Promise<BayanSocialPost> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  const ref = bayanDb().collection(socialCollections.posts).doc(postId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new BayanSocialError(404, "Post not found");
  const current = mapPost(snapshot.id, snapshot.data() || {});
  if (!canEditSocialPost(user, current.author.uid)) throw new BayanSocialError(403, "You cannot edit this post");
  const parsed = updatePostSchema.parse(input);
  if (parsed.status === "published" && !canPublishSocialPost(user)) {
    throw new BayanSocialError(403, "You cannot publish posts directly");
  }
  const patch: Record<string, unknown> = { ...parsed, updatedAt: nowIso() };
  if (parsed.status === "published" && !current.publishedAt) patch.publishedAt = nowIso();
  delete patch.submitForReview;
  await ref.update(patch);
  const updated = await ref.get();
  return mapPost(updated.id, updated.data() || {});
}

export async function deleteSocialPost(postId: string): Promise<void> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  const ref = bayanDb().collection(socialCollections.posts).doc(postId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new BayanSocialError(404, "Post not found");
  const current = mapPost(snapshot.id, snapshot.data() || {});
  if (!canEditSocialPost(user, current.author.uid)) throw new BayanSocialError(403, "You cannot delete this post");
  await ref.update({ status: "archived", updatedAt: nowIso() });
}

export async function listSocialFeed(options?: { limit?: number; cursor?: string; includePending?: boolean }): Promise<BayanSocialFeedPage> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  const limit = Math.min(Math.max(options?.limit || 20, 1), 50);
  let query = bayanDb().collection(socialCollections.posts)
    .where("schoolId", "==", user.schoolId)
    .orderBy("createdAt", "desc")
    .limit(limit + 1);
  if (!options?.includePending) query = query.where("status", "==", "published");
  if (options?.cursor) {
    const cursorDoc = await bayanDb().collection(socialCollections.posts).doc(options.cursor).get();
    if (cursorDoc.exists) query = query.startAfter(cursorDoc);
  }
  const snapshot = await query.get();
  const docs = snapshot.docs;
  const hasMore = docs.length > limit;
  const visible = docs.slice(0, limit).map((doc) => mapPost(doc.id, doc.data()));
  return { items: visible, nextCursor: hasMore ? visible.at(-1)?.id : undefined };
}

export async function getSocialPost(postId: string): Promise<BayanSocialPost> {
  const user = await getCurrentBayanUser();
  if (!user) throw new BayanSocialError(401, "Authentication required");
  const snapshot = await bayanDb().collection(socialCollections.posts).doc(postId).get();
  if (!snapshot.exists) throw new BayanSocialError(404, "Post not found");
  const post = mapPost(snapshot.id, snapshot.data() || {});
  if (post.schoolId !== user.schoolId) throw new BayanSocialError(403, "Forbidden");
  return post;
}
