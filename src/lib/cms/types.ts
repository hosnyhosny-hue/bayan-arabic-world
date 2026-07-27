export type CmsStatus = "draft" | "published" | "archived";

export interface CmsRecord {
  id?: string;
  titleAr: string;
  titleEn?: string;
  slug?: string;
  status: CmsStatus;
  order?: number;
  visible?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface MediaAsset {
  id?: string;
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
  createdAt?: string;
}
