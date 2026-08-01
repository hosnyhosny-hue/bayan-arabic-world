import { FieldValue, Timestamp } from "firebase-admin/firestore";

export const socialCollections = {
  posts: "bayan_social_posts",
  comments: "bayan_social_comments",
  reactions: "bayan_social_reactions",
  notifications: "bayan_social_notifications",
  follows: "bayan_social_follows",
} as const;

export function nowIso(): string {
  return new Date().toISOString();
}

export function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value && "toDate" in value) {
    const candidate = value as { toDate: () => Date };
    return candidate.toDate().toISOString();
  }
  return undefined;
}

export { FieldValue };
