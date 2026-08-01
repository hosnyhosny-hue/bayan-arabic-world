"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./family-experience.module.css";

type FeedItem = {
  id: string;
  type?: string;
  title?: string;
  content?: string;
  body?: string;
  caption?: string;
  authorName?: string;
  createdAt?: string;
  publishedAt?: string;
  imageUrl?: string;
  mediaUrl?: string;
  likesCount?: number;
  commentsCount?: number;
  eventDate?: string;
  category?: string;
};

type Story = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
};

const fallbackStories: Story[] = [
  { id: "arabic-bee", title: "Arabic Bee", subtitle: "تحديات اليوم", emoji: "ض" },
  { id: "achievements", title: "الإنجازات", subtitle: "نجوم بيان", emoji: "★" },
  { id: "events", title: "الفعاليات", subtitle: "هذا الأسبوع", emoji: "◉" },
  { id: "trips", title: "الرحلات", subtitle: "لحظات مميزة", emoji: "✦" },
  { id: "reading", title: "القراءة", subtitle: "قصص جديدة", emoji: "📚" },
];

const fallbackPosts: FeedItem[] = [
  {
    id: "welcome",
    type: "announcement",
    title: "مرحبًا بكم في BAYAN Family",
    content: "من هنا يبدأ نبض المدرسة: أخبار، إنجازات، فعاليات، صور، وقصص يومية في تجربة واحدة.",
    authorName: "فريق بيان",
    likesCount: 124,
    commentsCount: 18,
    category: "إعلان",
  },
  {
    id: "arabic-bee",
    type: "achievement",
    title: "تحدي Arabic Bee الأسبوعي",
    content: "شاركوا أبناءكم تحدي المفردات الجديد، واكتشفوا متصدر لوحة الشرف هذا الأسبوع.",
    authorName: "قسم اللغة العربية",
    likesCount: 96,
    commentsCount: 11,
    category: "Arabic Bee",
  },
  {
    id: "event",
    type: "event",
    title: "الفعالية القادمة",
    content: "يوم ثقافي يجمع اللغة والفن والموسيقى والهوية في تجربة مدرسية نابضة بالحياة.",
    authorName: "BAYAN Events",
    likesCount: 77,
    commentsCount: 9,
    category: "فعالية",
  },
];

function asText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function relativeTime(value?: string) {
  if (!value) return "الآن";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "حديثًا";
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.round(hours / 24)} يوم`;
}

export default function BayanFamilyExperience() {
  const [posts, setPosts] = useState<FeedItem[]>(fallbackPosts);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(true);
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let response = await fetch("/api/bayan-social/feed?limit=30", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          response = await fetch("/api/bayan-social/public-feed?limit=30", {
            cache: "no-store",
          });
          if (!cancelled) setGuest(true);
        } else if (!cancelled) {
          setGuest(false);
        }

        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data.posts)
            ? data.posts
            : Array.isArray(data.items)
              ? data.items
              : [];

          if (!cancelled && items.length) {
            setPosts(items);
          }
        }
      } catch {
        // Fallback posts keep the experience alive if the API is unavailable.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filters = ["الكل", "أخبار", "إنجازات", "فعاليات", "صور", "Arabic Bee"];

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => {
      const haystack = `${post.title || ""} ${post.content || post.body || post.caption || ""} ${post.category || ""}`.toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
      const matchesFilter =
        activeFilter === "الكل" ||
        haystack.includes(activeFilter.toLowerCase()) ||
        String(post.type || "").toLowerCase().includes(
          activeFilter === "إنجازات"
            ? "achievement"
            : activeFilter === "فعاليات"
              ? "event"
              : activeFilter === "صور"
                ? "image"
                : activeFilter.toLowerCase()
        );
      return matchesSearch && matchesFilter;
    });
  }, [posts, search, activeFilter]);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/parents" className={styles.brand}>
            <span className={styles.brandMark}>ب</span>
            <span>
              <strong>BAYAN Family</strong>
              <small>المدرسة كما تعيشها الأسرة</small>
            </span>
          </Link>

          <div className={styles.searchWrap}>
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث في نبض بيان..."
              aria-label="البحث في نبض بيان"
            />
          </div>

          <nav className={styles.nav}>
            <Link href="/events">الفعاليات</Link>
            <Link href="/achievements">الإنجازات</Link>
            <Link href="/media-gallery">المعرض</Link>
          </nav>
        </div>
      </header>

      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>BAYAN FAMILY EXPERIENCE 2.0</span>
            <h1>نبض المدرسة يبدأ من هنا</h1>
            <p>
              تجربة اجتماعية تعليمية حيّة تجمع الأخبار، الإنجازات، الفعاليات،
              الصور، والقصص اليومية في صفحة واحدة.
            </p>
            <div className={styles.heroActions}>
              <button onClick={() => document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" })}>
                استكشف النبض
              </button>
              <Link href="/achievements">إنجازات الأسبوع</Link>
            </div>
          </div>

          <div className={styles.heroCard}>
            <span className={styles.liveDot} />
            <small>ملخص اليوم</small>
            <strong>{guest ? "نسخة عامة آمنة" : "تجربة شخصية"}</strong>
            <p>أهم ما يحدث في مجتمع بيان، مرتبًا في مكان واحد.</p>
          </div>
        </section>

        <section className={styles.stories} aria-label="قصص بيان">
          {fallbackStories.map((story) => (
            <button className={styles.story} key={story.id}>
              <span className={styles.storyRing}>
                <span>{story.emoji}</span>
              </span>
              <strong>{story.title}</strong>
              <small>{story.subtitle}</small>
            </button>
          ))}
        </section>

        <section className={styles.layout}>
          <aside className={styles.sidebar}>
            <section className={styles.sideCard}>
              <span className={styles.sideEyebrow}>اليوم في بيان</span>
              <h2>عائلة واحدة، نبض واحد</h2>
              <p>كل جديد من المدرسة في واجهة واحدة سهلة وسريعة.</p>
            </section>

            <section className={styles.sideCard}>
              <h3>وصول سريع</h3>
              <div className={styles.quickLinks}>
                <Link href="/news">الأخبار</Link>
                <Link href="/events">الفعاليات</Link>
                <Link href="/achievements">الإنجازات</Link>
                <Link href="/resources">المصادر</Link>
              </div>
            </section>

            <section className={styles.sideCard}>
              <h3>BAYAN AI</h3>
              <p>قريبًا: ملخص ذكي يومي لأهم ما يخص الأسرة.</p>
              <button className={styles.aiButton}>اسأل بيان</button>
            </section>
          </aside>

          <section className={styles.feedColumn} id="feed">
            <div className={styles.feedHeader}>
              <div>
                <span className={styles.feedEyebrow}>LIVE SCHOOL FEED</span>
                <h2>نبض بيان</h2>
              </div>
              <span className={styles.statusPill}>{loading ? "جارٍ التحديث" : "مباشر"}</span>
            </div>

            <div className={styles.filters}>
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={activeFilter === filter ? styles.activeFilter : ""}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className={styles.feed}>
              {visiblePosts.length ? (
                visiblePosts.map((post, index) => (
                  <article
                    className={`${styles.post} ${
                      index % 4 === 0 ? styles.featuredPost : ""
                    }`}
                    key={post.id || String(index)}
                  >
                    <header className={styles.postHeader}>
                      <div className={styles.avatar}>
                        {asText(post.authorName, "ب").slice(0, 1)}
                      </div>
                      <div>
                        <strong>{asText(post.authorName, "فريق بيان")}</strong>
                        <small>{relativeTime(post.publishedAt || post.createdAt)}</small>
                      </div>
                      <span className={styles.category}>
                        {asText(post.category, asText(post.type, "تحديث"))}
                      </span>
                    </header>

                    <h3>{asText(post.title, "تحديث جديد من مجتمع بيان")}</h3>
                    <p>
                      {asText(
                        post.content || post.body || post.caption,
                        "تابعوا أحدث القصص والفعاليات والإنجازات من مجتمع بيان."
                      )}
                    </p>

                    {(post.imageUrl || post.mediaUrl) && (
                      <div className={styles.media}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asText(post.imageUrl || post.mediaUrl)}
                          alt={asText(post.title, "منشور بيان")}
                        />
                      </div>
                    )}

                    <footer className={styles.postFooter}>
                      <button>♡ {post.likesCount ?? 0}</button>
                      <button>◌ {post.commentsCount ?? 0}</button>
                      <button>↗ مشاركة</button>
                      <button>⌑ حفظ</button>
                    </footer>
                  </article>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <strong>لا توجد نتائج مطابقة</strong>
                  <p>جرّب كلمة بحث أخرى أو اختر تصنيفًا مختلفًا.</p>
                </div>
              )}
            </div>
          </section>

          <aside className={styles.rightRail}>
            <section className={styles.sideCard}>
              <span className={styles.sideEyebrow}>القادم</span>
              <h3>فعاليات هذا الأسبوع</h3>
              <div className={styles.timelineItem}>
                <span>01</span>
                <div>
                  <strong>Arabic Bee</strong>
                  <small>تحدي اللغة الأسبوعي</small>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span>02</span>
                <div>
                  <strong>معرض الإنجازات</strong>
                  <small>احتفاء بأعمال الطلبة</small>
                </div>
              </div>
            </section>

            <section className={styles.sideCard}>
              <span className={styles.sideEyebrow}>الأكثر تداولًا</span>
              <ol className={styles.trending}>
                <li>Arabic Bee</li>
                <li>نجوم الأسبوع</li>
                <li>الرحلات المدرسية</li>
                <li>معرض اللغة العربية</li>
              </ol>
            </section>

            {guest && (
              <section className={styles.publicNotice}>
                <strong>وضع العرض العام</strong>
                <p>
                  لا تُعرض بيانات الأبناء أو الرسائل أو التقارير الخاصة في النسخة العامة.
                </p>
              </section>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
