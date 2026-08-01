export type BayanDevice = "desktop" | "tablet" | "mobile";

export type BayanBlockType =
  | "hero"
  | "channels"
  | "stories"
  | "feed"
  | "quickLinks"
  | "events"
  | "achievements"
  | "gallery"
  | "arabicBee"
  | "stats"
  | "cta"
  | "spacer";

export type BayanDataMode = "collection" | "manual" | "computed";

export type BayanManualItem = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  icon?: string;
  href?: string;
  filter?: string;
  badge?: string;
};

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

  dataMode?: BayanDataMode;
  source?: string;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  filters?: Array<{ field: string; operator: "==" | "array-contains"; value: string }>;
  manualItems?: BayanManualItem[];

  interaction?: {
    mode?: "none" | "filter-feed" | "navigate";
    queryParam?: string;
  };
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
    surface: string;
    text: string;
    muted: string;
    radius: number;
    spacing: number;
  };
  blocks: BayanBlock[];
  updatedAt?: string;
  publishedAt?: string;
};
