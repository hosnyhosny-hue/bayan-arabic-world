export type FamilyChild = {
  id: string;
  name: string;
  yearGroup: string;
  initials?: string;
  attendance?: number;
  homeworkDue?: number;
  unreadMessages?: number;
  achievementCount?: number;
  progressLabel?: string;
};

export type FamilyPulseItem = {
  id: string;
  title: string;
  excerpt?: string;
  type?: "news" | "achievement" | "event" | "video" | "photo";
  imageUrl?: string;
  publishedAt?: string;
  authorName?: string;
};

export type FamilyMessage = {
  id: string;
  sender: string;
  subject: string;
  preview?: string;
  createdAt?: string;
  unread?: boolean;
};

export type FamilyEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
};

export type FamilyAchievement = {
  id: string;
  title: string;
  childName?: string;
  description?: string;
  awardedAt?: string;
};

export type FamilyDashboardData = {
  parent: {
    name: string;
    email?: string;
  };
  children: FamilyChild[];
  pulse: FamilyPulseItem[];
  messages: FamilyMessage[];
  events: FamilyEvent[];
  achievements: FamilyAchievement[];
  stats: {
    unreadUpdates: number;
    upcomingEvents: number;
    pendingHomework: number;
  };
};
