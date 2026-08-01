export type BayanBlockType =
  | "hero"
  | "stories"
  | "feed"
  | "events"
  | "achievements"
  | "gallery"
  | "arabicBee"
  | "stats"
  | "cta"
  | "spacer";

export type BayanDevice = "desktop" | "tablet" | "mobile";

export type BayanBlock = {
  id: string;
  type: BayanBlockType;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  buttonLabel?: string;
  buttonHref?: string;
  align?: "start" | "center";
  variant?: "default" | "gradient" | "glass" | "minimal";
  visible?: boolean;
  source?: string;
  limit?: number;
};

export type BayanExperienceDocument = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  version: number;
  theme: {
    primary: string;
    secondary: string;
    background: string;
    radius: number;
    spacing: number;
  };
  blocks: BayanBlock[];
  updatedAt?: string;
  publishedAt?: string;
};
