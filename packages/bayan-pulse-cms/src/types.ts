export type PulseLocale = "ar" | "en";
export type PulseStatus = "draft" | "review" | "scheduled" | "published" | "archived";
export type PulseContentType =
  | "news" | "story" | "event" | "achievement" | "video"
  | "quote" | "gallery" | "arabic-bee" | "community";
export type PulseChannel =
  | "school-news" | "arabic" | "events" | "achievements"
  | "arabic-bee" | "video" | "community";

export type PulseContentDocument = {
  id: string;
  locale: PulseLocale;
  type: PulseContentType;
  channel: PulseChannel;
  status: PulseStatus;
  title: string;
  excerpt?: string;
  body?: string;
  authorName?: string;
  coverUrl?: string;
  tags?: string[];
  isFeatured?: boolean;
  isBreaking?: boolean;
  isLive?: boolean;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PulseHeroDocument = {
  id: string;
  locale: PulseLocale;
  slot: "morning" | "day" | "evening" | "night";
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  enabled: boolean;
};
