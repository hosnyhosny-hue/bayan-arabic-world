export type ExperienceAudience = "public" | "parents" | "students" | "staff" | "all";
export type DeviceMode = "desktop" | "tablet" | "mobile";

export type MotionPreset =
  | "none"
  | "fade"
  | "slide-up"
  | "scale"
  | "blur"
  | "parallax";

export type SceneType =
  | "hero"
  | "channels"
  | "stories"
  | "feed"
  | "events"
  | "achievements"
  | "gallery"
  | "arabicBee"
  | "cta"
  | "custom";

export type BindingValue = {
  mode: "static" | "field";
  value: string;
};

export type SceneBindings = {
  title?: BindingValue;
  subtitle?: BindingValue;
  image?: BindingValue;
  body?: BindingValue;
  buttonLabel?: BindingValue;
  buttonHref?: BindingValue;
};

export type SceneDataSource = {
  collection?: string;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  filters?: Array<{
    field: string;
    operator: "==" | "array-contains";
    value: string;
  }>;
};

export type ExperienceScene = {
  id: string;
  type: SceneType;
  name: string;
  enabled: boolean;
  locked?: boolean;
  audience?: ExperienceAudience;
  motion?: MotionPreset;
  data?: SceneDataSource;
  bindings?: SceneBindings;
  style?: {
    variant?: "default" | "gradient" | "glass" | "editorial" | "minimal";
    align?: "start" | "center";
    minHeight?: number;
    background?: string;
    textColor?: string;
  };
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
