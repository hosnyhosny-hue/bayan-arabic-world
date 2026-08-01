import styles from "./bayan-visual-refresh.module.css";

const stories = [
  { title: "صباح بيان", subtitle: "منذ 12 دقيقة", image: "/og-image.jpg" },
  { title: "داخل الصف", subtitle: "جديد", image: "/images/bayan/story-class.jpg" },
  { title: "Arabic Bee", subtitle: "اليوم", image: "/images/bayan/story-bee.jpg" },
  { title: "إنجازات", subtitle: "6 قصص", image: "/images/bayan/story-achievement.jpg" },
  { title: "الفعاليات", subtitle: "هذا الأسبوع", image: "/images/bayan/story-event.jpg" },
  { title: "مجتمع بيان", subtitle: "جديد", image: "/images/bayan/story-community.jpg" },
];

export default function BayanStories() {
  return (
    <div className={styles.stories}>
      {stories.map((story) => (
        <button className={styles.story} key={story.title}>
          <span className={styles.storyRing}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.image} alt="" />
          </span>
          <strong>{story.title}</strong>
          <small>{story.subtitle}</small>
        </button>
      ))}
    </div>
  );
}
