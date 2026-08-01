export const BAYAN_SOCIAL_POST_TYPES = [
  "announcement",
  "achievement",
  "class_update",
  "event",
  "story",
  "resource",
] as const;
export type BayanSocialPostType = (typeof BAYAN_SOCIAL_POST_TYPES)[number];

export const BAYAN_SOCIAL_VISIBILITIES = ["public", "school", "year", "class", "family"] as const;
export type BayanSocialVisibility = (typeof BAYAN_SOCIAL_VISIBILITIES)[number];

export const BAYAN_SOCIAL_STATUSES = ["draft", "pending", "published", "rejected", "archived"] as const;
export type BayanSocialStatus = (typeof BAYAN_SOCIAL_STATUSES)[number];

export type BayanSocialReactionType = "like" | "celebrate" | "love" | "insightful";

export interface BayanSocialMediaItem {
  id: string;
  url: string;
  mimeType: string;
  name?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  altAr?: string;
  altEn?: string;
}

export interface BayanSocialAudience {
  schoolId: string;
  yearGroups?: string[];
  classIds?: string[];
  familyIds?: string[];
}

export interface BayanSocialAuthor {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: string;
}

export interface BayanSocialPost {
  id: string;
  schoolId: string;
  author: BayanSocialAuthor;
  type: BayanSocialPostType;
  status: BayanSocialStatus;
  visibility: BayanSocialVisibility;
  audience: BayanSocialAudience;
  titleAr?: string;
  titleEn?: string;
  bodyAr: string;
  bodyEn?: string;
  media: BayanSocialMediaItem[];
  tags: string[];
  pinned: boolean;
  commentsEnabled: boolean;
  reactionCounts: Partial<Record<BayanSocialReactionType, number>>;
  commentsCount: number;
  viewsCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  moderation?: {
    reviewedBy?: string;
    reviewedAt?: string;
    rejectionReason?: string;
  };
}

export interface BayanSocialComment {
  id: string;
  postId: string;
  schoolId: string;
  author: BayanSocialAuthor;
  body: string;
  status: "published" | "pending" | "rejected" | "deleted";
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BayanSocialNotification {
  id: string;
  recipientId: string;
  schoolId: string;
  type: "post_published" | "comment" | "reaction" | "moderation";
  titleAr: string;
  titleEn?: string;
  bodyAr?: string;
  bodyEn?: string;
  href?: string;
  readAt?: string;
  createdAt: string;
}

export interface BayanSocialFeedPage {
  items: BayanSocialPost[];
  nextCursor?: string;
}
