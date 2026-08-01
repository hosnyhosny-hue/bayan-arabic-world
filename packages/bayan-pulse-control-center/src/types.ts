export type PulseControlRole =
  | "super-admin"
  | "pulse-director"
  | "editor"
  | "reviewer"
  | "publisher"
  | "events-manager"
  | "media-manager"
  | "arabic-bee-manager"
  | "analytics-viewer";

export type PulseControlPermission =
  | "dashboard.view"
  | "content.view"
  | "content.create"
  | "content.edit"
  | "content.review"
  | "content.publish"
  | "stories.manage"
  | "edition.manage"
  | "hero.manage"
  | "channels.manage"
  | "events.manage"
  | "achievements.manage"
  | "arabic-bee.manage"
  | "media.manage"
  | "analytics.view"
  | "settings.manage"
  | "users.manage"
  | "audit.view";

export type PulseDashboardMetrics = {
  drafts: number;
  review: number;
  scheduled: number;
  publishedToday: number;
  activeStories: number;
  todayEvents: number;
  breakingNews: number;
  mediaIssues: number;
};

export type PulseDashboardActivity = {
  id: string;
  action: string;
  entityType: string;
  entityTitle: string;
  actorName: string;
  createdAt: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export type PulseHealthStatus = {
  id: string;
  label: string;
  status: "healthy" | "warning" | "error";
  detail: string;
};
