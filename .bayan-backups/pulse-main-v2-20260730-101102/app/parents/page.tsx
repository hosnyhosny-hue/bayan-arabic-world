import Link from "next/link";
import BayanPremiumShell from "@/app/(public)/bayan-visual-refresh/BayanPremiumShell";
import BayanStories from "@/app/(public)/bayan-visual-refresh/BayanStories";
import styles from "@/app/(public)/bayan-visual-refresh/bayan-visual-refresh.module.css";

export default function ParentsPage() {
  return (
    <BayanPremiumShell active="parents">
      <div className={styles.container}>
        <section className={styles.hero}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.heroImage} src="/og-image.jpg" alt="" />
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>BAYAN FAMILY EXPERIENCE</span>
            <h1 className={styles.heroTitle}>مدرستكم أقرب، أوضح، وأكثر حياة.</h1>
            <p className={styles.heroCopy}>
              مساحة واحدة تجمع أخبار المدرسة، قصص الطلاب، الفعاليات والإنجازات في تجربة هادئة ومصممة للعائلة.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/pulse">استكشف نبض اليوم</Link>
              <Link className={styles.secondaryButton} href="#events">فعاليات الأسبوع</Link>
            </div>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.metric}><strong>24</strong><small>تحديثًا هذا الأسبوع</small></div>
            <div className={styles.metric}><strong>8</strong><small>قصص جديدة</small></div>
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeading}>
            <div><span>STORIES</span><h2>قصص اليوم</h2></div>
            <p>لقطات سريعة من الحياة اليومية داخل المدرسة، مصممة لتصل إليكم في ثوانٍ.</p>
          </header>
          <BayanStories />
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeading}>
            <div><span>SCHOOL EDITION</span><h2>هذا ما يحدث الآن</h2></div>
            <p>توزيع تحريري يبرز الأهم أولًا، بدل عرض كل الأخبار بالشكل نفسه.</p>
          </header>

          <div className={styles.editorialGrid}>
            <article className={styles.leadStory}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/og-image.jpg" alt="" />
              <div className={styles.storyContent}>
                <span>خبر اليوم</span>
                <h3>لغة تصنع الثقة، ومجتمع يحتفي بكل خطوة.</h3>
                <p>رحلة يومية تجمع التعلم والثقافة والإبداع داخل قسم اللغة العربية.</p>
              </div>
            </article>

            <div className={styles.sideColumn}>
              <article className={styles.sideStory}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/bayan/editorial-1.jpg" alt="" />
                <div className={styles.storyContent}>
                  <span>Arabic Bee</span>
                  <h3>المنافسة تبدأ من كلمة.</h3>
                </div>
              </article>
              <article className={styles.sideStory}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/bayan/editorial-2.jpg" alt="" />
                <div className={styles.storyContent}>
                  <span>Community</span>
                  <h3>لحظات صغيرة، أثر كبير.</h3>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.newsGrid}>
            <article className={styles.quoteCard}>
              <div className={styles.quoteMark}>“</div>
              <blockquote>أجمل ما في العربية أنها تمنح الطالب صوتًا وهوية وثقة.</blockquote>
              <footer>من مجتمع بيان</footer>
            </article>

            <article className={styles.achievementCard}>
              <div className={styles.cardIcon}>★</div>
              <span className={styles.cardLabel}>ACHIEVEMENT</span>
              <h3>لوحة الشرف الأسبوعية</h3>
              <p>احتفاء بالطلاب الذين صنعوا أثرًا بالتعلم والمبادرة.</p>
            </article>

            <article className={styles.eventCard}>
              <div className={styles.cardIcon}>◷</div>
              <span className={styles.cardLabel}>NEXT EVENT</span>
              <h3>معرض اللغة العربية</h3>
              <p>تجربة تفاعلية تجمع المشاريع والقصص والإبداع الطلابي.</p>
            </article>
          </div>
        </section>

        <section id="events" className={styles.section}>
          <header className={styles.sectionHeading}>
            <div><span>THIS WEEK</span><h2>الفعاليات القادمة</h2></div>
            <p>جدول واضح وسهل القراءة يساعد العائلة على معرفة ما ينتظرها خلال الأسبوع.</p>
          </header>

          <div className={styles.timeline}>
            <div className={styles.timelineDays}>
              <button className={`${styles.dayButton} ${styles.dayButtonActive}`}>اليوم</button>
              <button className={styles.dayButton}>غدًا</button>
              <button className={styles.dayButton}>هذا الأسبوع</button>
              <button className={styles.dayButton}>هذا الشهر</button>
            </div>

            <div className={styles.timelineList}>
              {[
                ["08:00", "تحدي Arabic Bee", "المسرح الرئيسي", "مباشر"],
                ["10:30", "عرض مشاريع الطلاب", "مركز التعلم", "اليوم"],
                ["13:00", "لقاء أولياء الأمور", "قاعة المجتمع", "قريبًا"],
              ].map(([time, title, place, badge]) => (
                <article className={styles.timelineItem} key={title}>
                  <div className={styles.timelineTime}><strong>{time}</strong><small>صباحًا</small></div>
                  <div className={styles.timelineCopy}><h3>{title}</h3><p>{place}</p></div>
                  <span className={styles.timelineBadge}>{badge}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div>
            <h2>كل ما يهم عائلتكم، في مكان واحد.</h2>
            <p>ادخلوا إلى التجربة الخاصة لعرض الإشعارات والتقارير والمحتوى المرتبط بأبنائكم.</p>
          </div>
          <Link className={styles.primaryButton} href="/login">دخول العائلة</Link>
        </section>
      </div>
    </BayanPremiumShell>
  );
}
