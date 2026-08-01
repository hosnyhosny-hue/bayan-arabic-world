export const BAYAN_ROLES = [
  "super_admin",
  "admin",
  "head_of_department",
  "teacher",
  "parent",
  "student",
  "editor",
  "moderator",
] as const;

export type BayanRole = (typeof BAYAN_ROLES)[number];

export const BAYAN_PERMISSIONS = [
  "users.read",
  "users.create",
  "users.update",
  "users.delete",
  "roles.manage",
  "media.read",
  "media.upload",
  "media.delete",
  "settings.read",
  "settings.update",
  "content.moderate",
] as const;

export type BayanPermission = (typeof BAYAN_PERMISSIONS)[number];

export type BayanUserStatus = "active" | "invited" | "suspended";

export interface BayanUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: BayanRole;
  permissions?: BayanPermission[];
  status: BayanUserStatus;
  locale: "ar" | "en";
  schoolId: string;
  familyId?: string;
  studentIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BayanSettings {
  schoolId: string;
  schoolNameAr: string;
  schoolNameEn: string;
  defaultLocale: "ar" | "en";
  allowParentComments: boolean;
  requireCommentModeration: boolean;
  maxUploadMb: number;
  allowedMediaTypes: string[];
  brand: {
    primary: string;
    secondary: string;
    logoUrl?: string;
  };
  updatedAt?: string;
  updatedBy?: string;
}

export interface BayanMediaRecord {
  id: string;
  ownerId: string;
  schoolId: string;
  path: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  visibility: "public" | "school" | "class" | "private";
  createdAt: string;
}
