export type BayanAccessMode = "guest" | "parent" | "teacher" | "student" | "admin";

export interface BayanViewer { uid?: string | null; role?: string | null; displayName?: string | null; email?: string | null; }

const ROLE_MAP: Record<string, BayanAccessMode> = {
  "super-admin": "admin", super_admin: "admin", admin: "admin", moderator: "admin",
  teacher: "teacher", staff: "teacher", parent: "parent", guardian: "parent",
  student: "student", pupil: "student",
};

export function resolveBayanAccessMode(viewer?: BayanViewer | null): BayanAccessMode {
  if (!viewer?.uid) return "guest";
  const role = String(viewer.role || "").trim().toLowerCase();
  return ROLE_MAP[role] || "guest";
}

export const canViewPrivateFamilyData = (mode: BayanAccessMode) => mode === "parent" || mode === "admin";
export const canPublishSocialContent = (mode: BayanAccessMode) => mode === "teacher" || mode === "admin";
export const canModerateSocialContent = (mode: BayanAccessMode) => mode === "admin";
export const canInteractWithSocialContent = (mode: BayanAccessMode) => mode !== "guest";
