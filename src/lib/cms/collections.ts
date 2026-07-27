export const CMS_COLLECTIONS = {
  pages: "cms_pages",
  homepage: "cms_homepage_sections",
  news: "cms_news",
  events: "cms_events",
  media: "cms_media",
  team: "cms_team",
  students: "cms_students",
  magazines: "cms_magazines",
  resources: "cms_resources",
  menus: "cms_menus",
  forms: "cms_forms",
  settings: "cms_settings",
  activity: "cms_activity",
} as const;

export type CmsCollection =
  (typeof CMS_COLLECTIONS)[keyof typeof CMS_COLLECTIONS];
