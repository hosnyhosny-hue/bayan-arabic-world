import { z } from "zod";

const mediaItem = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  mimeType: z.string().min(1),
  name: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  durationSeconds: z.number().nonnegative().optional(),
  altAr: z.string().max(180).optional(),
  altEn: z.string().max(180).optional(),
});

export const createPostSchema = z.object({
  type: z.enum(["announcement", "achievement", "class_update", "event", "story", "resource"]),
  visibility: z.enum(["public", "school", "year", "class", "family"]).default("school"),
  titleAr: z.string().max(140).optional(),
  titleEn: z.string().max(140).optional(),
  bodyAr: z.string().trim().min(1).max(10000),
  bodyEn: z.string().trim().max(10000).optional(),
  media: z.array(mediaItem).max(12).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  yearGroups: z.array(z.string()).max(20).default([]),
  classIds: z.array(z.string()).max(50).default([]),
  familyIds: z.array(z.string()).max(100).default([]),
  pinned: z.boolean().default(false),
  commentsEnabled: z.boolean().default(true),
  submitForReview: z.boolean().default(true),
});

export const updatePostSchema = createPostSchema.partial().extend({
  status: z.enum(["draft", "pending", "published", "rejected", "archived"]).optional(),
});

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
  parentCommentId: z.string().min(1).optional(),
});

export const reactionSchema = z.object({
  postId: z.string().min(1),
  reaction: z.enum(["like", "celebrate", "love", "insightful"]),
});

export const moderationSchema = z.object({
  entityType: z.enum(["post", "comment"]),
  entityId: z.string().min(1),
  action: z.enum(["approve", "reject", "archive"]),
  reason: z.string().trim().max(500).optional(),
});
