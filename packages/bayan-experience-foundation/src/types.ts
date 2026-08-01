export type ExperienceAudience = "public" | "parents" | "students" | "staff" | "all";
export type DeviceMode = "desktop" | "tablet" | "mobile";
export type MotionPreset = "none" | "fade" | "slide-up" | "scale" | "blur" | "parallax";
export type SceneType = "hero" | "channels" | "stories" | "feed" | "events" | "achievements" | "gallery" | "arabicBee" | "cta" | "custom";
export type BindingValue = { mode: "static" | "field"; value: string };
export type SceneFrame = { x: number; y: number; w: number; h: number };

export type ExperienceScene = {
  id: string;
  type: SceneType;
  name: string;
  enabled: boolean;
  locked?: boolean;
  audience?: ExperienceAudience;
  motion?: MotionPreset;
  data?: {
    collection?: string;
    limit?: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
    filters?: Array<{ field: string; operator: "==" | "array-contains"; value: string }>;
  };
  bindings?: {
    title?: BindingValue;
    subtitle?: BindingValue;
    image?: BindingValue;
    body?: BindingValue;
    buttonLabel?: BindingValue;
    buttonHref?: BindingValue;
  };
  style?: {
    variant?: "default" | "gradient" | "glass" | "editorial" | "minimal";
    align?: "start" | "center";
    background?: string;
    textColor?: string;
    minHeight?: number;
  };
  frames?: Record<DeviceMode, SceneFrame>;
};

export type ExperienceTheme = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  radius: number;
  spacing: number;
  fontScale: number;
};

export type ExperienceFoundationDocument = {
  id: string;
  name: string;
  slug: string;
  version: number;
  status: "draft" | "published" | "archived";
  theme: ExperienceTheme;
  scenes: ExperienceScene[];
  updatedAt?: string;
  publishedAt?: string;
};
