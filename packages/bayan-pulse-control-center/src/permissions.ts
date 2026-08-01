import type { PulseControlPermission, PulseControlRole } from "./types";

export const rolePermissions: Record<PulseControlRole, PulseControlPermission[]> = {
  "super-admin": [
    "dashboard.view","content.view","content.create","content.edit","content.review",
    "content.publish","stories.manage","edition.manage","hero.manage","channels.manage",
    "events.manage","achievements.manage","arabic-bee.manage","media.manage",
    "analytics.view","settings.manage","users.manage","audit.view"
  ],
  "pulse-director": [
    "dashboard.view","content.view","content.create","content.edit","content.review",
    "content.publish","stories.manage","edition.manage","hero.manage","channels.manage",
    "events.manage","achievements.manage","arabic-bee.manage","media.manage",
    "analytics.view","audit.view"
  ],
  editor: ["dashboard.view","content.view","content.create","content.edit","stories.manage","media.manage"],
  reviewer: ["dashboard.view","content.view","content.review","analytics.view"],
  publisher: ["dashboard.view","content.view","content.review","content.publish","edition.manage","hero.manage"],
  "events-manager": ["dashboard.view","content.view","content.create","content.edit","events.manage"],
  "media-manager": ["dashboard.view","content.view","media.manage"],
  "arabic-bee-manager": ["dashboard.view","content.view","content.create","content.edit","arabic-bee.manage"],
  "analytics-viewer": ["dashboard.view","analytics.view"]
};

export function can(role: PulseControlRole, permission: PulseControlPermission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
