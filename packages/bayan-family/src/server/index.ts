import type { FamilyDashboardData, FamilyPulseItem } from "../types";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const text = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

export function normalizeFamilyDashboard(
  mePayload: unknown,
  feedPayload: unknown,
): FamilyDashboardData {
  const meRoot = asRecord(mePayload);
  const user = asRecord(meRoot.user ?? meRoot.data ?? meRoot);
  const feedRoot = asRecord(feedPayload);
  const rawPosts = asArray(feedRoot.posts ?? feedRoot.items ?? feedRoot.data);

  const pulse: FamilyPulseItem[] = rawPosts.slice(0, 6).map((entry, index) => {
    const post = asRecord(entry);
    const media = asArray(post.media);
    const firstMedia = asRecord(media[0]);
    return {
      id: text(post.id, `pulse-${index + 1}`),
      title: text(post.title, text(post.content, "تحديث جديد من مجتمع بيان")),
      excerpt: text(post.excerpt, text(post.content)).slice(0, 180),
      type: (text(post.type, "news") as FamilyPulseItem["type"]),
      imageUrl: text(post.imageUrl, text(firstMedia.url)) || undefined,
      publishedAt: text(post.publishedAt, text(post.createdAt)) || undefined,
      authorName: text(post.authorName, text(post.author)) || undefined,
    };
  });

  const parentName = text(user.displayName, text(user.name, text(user.email, "ولي الأمر")));

  return {
    parent: { name: parentName, email: text(user.email) || undefined },
    children: [
      {
        id: "family-child-1",
        name: "ملف الطالب",
        yearGroup: "BAYAN Family",
        initials: "ب",
        attendance: 96,
        homeworkDue: 0,
        unreadMessages: 0,
        achievementCount: 0,
        progressLabel: "متابعة مستقرة",
      },
    ],
    pulse,
    messages: [],
    events: [],
    achievements: [],
    stats: {
      unreadUpdates: pulse.length,
      upcomingEvents: 0,
      pendingHomework: 0,
    },
  };
}

export function fallbackFamilyDashboard(): FamilyDashboardData {
  return normalizeFamilyDashboard({}, { posts: [] });
}
