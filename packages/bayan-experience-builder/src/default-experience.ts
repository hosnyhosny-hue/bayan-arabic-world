import type { BayanExperienceDocument } from "./types";

export const defaultFamilyExperience: BayanExperienceDocument = {
  id: "family-home",
  name: "BAYAN Family",
  slug: "parents",
  status: "draft",
  version: 2,
  theme: {
    primary: "#0d6b4d",
    secondary: "#ef8b27",
    background: "#f5f8f6",
    surface: "#ffffff",
    text: "#173b32",
    muted: "#6f857d",
    radius: 28,
    spacing: 20,
  },
  blocks: [
    {
      id: "hero-main",
      type: "hero",
      title: "نبض المدرسة يبدأ من هنا",
      subtitle: "تجربة اجتماعية تعليمية حيّة تجمع أخبار المدرسة وإنجازاتها وفعالياتها.",
      buttonLabel: "استكشف النبض",
      buttonHref: "#feed",
      variant: "gradient",
      visible: true,
      dataMode: "collection",
      source: "bayan_pulse_content",
      limit: 1,
      filters: [{ field: "kind", operator: "==", value: "hero" }],
      orderBy: "updatedAt",
      orderDirection: "desc"
    },
    {
      id: "channels-main",
      type: "channels",
      title: "قنوات بيان",
      visible: true,
      dataMode: "collection",
      source: "bayan_channels",
      limit: 8,
      orderBy: "order",
      orderDirection: "asc",
      interaction: { mode: "filter-feed", queryParam: "channel" }
    },
    {
      id: "stories-main",
      type: "stories",
      title: "قصص بيان",
      visible: true,
      dataMode: "collection",
      source: "bayan_pulse_stories",
      limit: 8,
      orderBy: "publishedAt",
      orderDirection: "desc"
    },
    {
      id: "feed-main",
      type: "feed",
      title: "نبض بيان",
      visible: true,
      dataMode: "collection",
      source: "bayan_social_posts",
      limit: 20,
      orderBy: "publishedAt",
      orderDirection: "desc",
      filters: [{ field: "status", operator: "==", value: "published" }]
    },
    {
      id: "quick-links-main",
      type: "quickLinks",
      title: "وصول سريع",
      visible: true,
      dataMode: "collection",
      source: "bayan_quick_links",
      limit: 8,
      orderBy: "order",
      orderDirection: "asc"
    },
    {
      id: "events-main",
      type: "events",
      title: "الفعاليات القادمة",
      visible: true,
      dataMode: "collection",
      source: "bayan_events",
      limit: 4,
      orderBy: "startAt",
      orderDirection: "asc"
    },
    {
      id: "achievements-main",
      type: "achievements",
      title: "إنجازات الأسبوع",
      visible: true,
      dataMode: "collection",
      source: "bayan_achievements",
      limit: 6,
      orderBy: "publishedAt",
      orderDirection: "desc"
    }
  ]
};
