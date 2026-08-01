import type { BayanUserProfile } from "@bayan/core/types";

const PUBLISH_ROLES = new Set(["super_admin", "admin", "head_of_department", "editor"]);
const MODERATE_ROLES = new Set(["super_admin", "admin", "head_of_department", "moderator"]);
const AUTHOR_ROLES = new Set(["super_admin", "admin", "head_of_department", "teacher", "editor"]);

export function canCreateSocialPost(user: BayanUserProfile): boolean {
  return user.status === "active" && AUTHOR_ROLES.has(user.role);
}

export function canPublishSocialPost(user: BayanUserProfile): boolean {
  return user.status === "active" && PUBLISH_ROLES.has(user.role);
}

export function canModerateSocial(user: BayanUserProfile): boolean {
  return user.status === "active" && MODERATE_ROLES.has(user.role);
}

export function canEditSocialPost(user: BayanUserProfile, authorId: string): boolean {
  return canModerateSocial(user) || user.uid === authorId;
}

export function canCommentSocial(user: BayanUserProfile): boolean {
  return user.status === "active";
}
