import type { BayanPermission, BayanRole } from "./types";

const ROLE_PERMISSIONS: Record<BayanRole, readonly BayanPermission[]> = {
  super_admin: [
    "users.read", "users.create", "users.update", "users.delete", "roles.manage",
    "media.read", "media.upload", "media.delete", "settings.read", "settings.update",
    "content.moderate",
  ],
  admin: [
    "users.read", "users.create", "users.update", "roles.manage",
    "media.read", "media.upload", "media.delete", "settings.read", "settings.update",
    "content.moderate",
  ],
  head_of_department: [
    "users.read", "users.create", "users.update",
    "media.read", "media.upload", "media.delete", "settings.read", "content.moderate",
  ],
  teacher: ["media.read", "media.upload", "settings.read"],
  editor: ["media.read", "media.upload", "media.delete", "settings.read"],
  moderator: ["media.read", "settings.read", "content.moderate"],
  parent: ["media.read", "settings.read"],
  student: ["media.read", "settings.read"],
};

export function permissionsForRole(role: BayanRole): BayanPermission[] {
  return [...ROLE_PERMISSIONS[role]];
}

export function hasPermission(
  role: BayanRole,
  permission: BayanPermission,
  extra: BayanPermission[] = [],
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission) || extra.includes(permission);
}
