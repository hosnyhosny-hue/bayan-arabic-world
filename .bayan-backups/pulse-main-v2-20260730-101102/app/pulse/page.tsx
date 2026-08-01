import Link from "next/link";
import BayanPremiumShell from "@/app/(public)/bayan-visual-refresh/BayanPremiumShell";
import BayanStories from "@/app/(public)/bayan-visual-refresh/BayanStories";
import styles from "@/app/(public)/bayan-visual-refresh/bayan-visual-refresh.module.css";

export default function PulsePage() {
  return (
    <BayanPremiumShell active="pulse">
      <div className={styles.container}>
        <section className={styles.hero}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.heroImage} src="/images/bayan/pulse-hero.jpg" alt="" />
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>THE LIVING SCHOOL</span>
            <h1 className={styles.heroTitle}>نبض بيان؛ المدرسة كما تعيشها الآن.</h1>
            <p className={styles.heroCopy}>
              أخبار، قصص، صور، فيديو وإنجازات تتحول إلى صحيفة رقمية حية بإيقاع بصري متجدد.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="#today">اقرأ إصدار اليوم</Link>
              <Link className={styles.secondaryButton} href="/parents">تجربة العائلة</Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeading}>
            <div><span>LIVE STORIES</span><h2>المشهد في دقيقة</h2></div>
            <p>قصص قصيرة تختصر أهم ما حدث اليوم داخل مجتمع بيان.</p>
          </header>
          <BayanStories />
        </section>

        <section id="today" className={styles.section}>
          <header className={styles.sectionHeading}>
            <div><span>TODAY’S EDITION</span><h2>إصدار اليوم</h2></div>
            <p>الأخبار مرتبة حسب الأهمية والقيمة، لا حسب وقت النشر فقط.</p>
          </header>

          <div className={styles.editorialGrid}>
            <article className={styles.leadStory}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/bayan/pulse-lead.jpg" alt="" />
              <div className={styles.storyContent}>
                <span>العنوان الرئيسي</span>
                <h3>يوم جديد من التعلم، التحدي والاحتفاء.</h3>
                <p>أبرز ما جرى داخل الصفوف والفعاليات والمجتمع المدرسي في إصدار واحد.</p>
              </div>
            </article>

            <div className={styles.sideColumn}>
              <article className={styles.sideStory}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/bayan/pulse-side-1.jpg" alt="" />
                <div className={styles.storyContent}>
                  <span>فيديو</span>
                  <h3>وراء كواليس Arabic Bee.</h3>
                </div>
              </article>
              <article className={styles.sideStory}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/bayan/pulse-side-2.jpg" alt="" />
                <div className={styles.storyContent}>
                  <span>إنجاز</span>
                  <h3>طلاب الأسبوع يصنعون الفارق.</h3>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.newsGrid}>
            <article className={styles.eventCard}>
              <div className={styles.cardIcon}>▶</div>
              <span className={styles.cardLabel}>VIDEO STORY</span>
              <h3>90 ثانية من يومنا</h3>
              <p>فيديو قصير يلتقط أجمل تفاصيل المدرسة في إيقاع سريع.</p>
            </article>

            <article className={styles.quoteCard}>
              <div className={styles.quoteMark}>“</div>
              <blockquote>كل قصة جيدة تبدأ بلحظة حقيقية.</blockquote>
              <footer>فريق نبض بيان</footer>
            </article>

            <article className={styles.achievementCard}>
              <div className={styles.cardIcon}>⌁</div>
              <span className={styles.cardLabel}>TRENDING</span>
              <h3>الأكثر مشاهدة هذا الأسبوع</h3>
              <p>مختارات من المحتوى الذي لفت انتباه مجتمع المدرسة.</p>
            </article>
          </div>
        </section>

        <section className={styles.cta}>
          <div>
            <h2>هذه ليست صفحة أخبار؛ إنها مدرسة حية.</h2>
            <p>تابعوا القصص والفعاليات والإنجازات في تجربة تحريرية متجددة كل يوم.</p>
          </div>
          <Link className={styles.primaryButton} href="/parents">انتقل إلى تجربة العائلة</Link>
        </section>
      </div>
    </BayanPremiumShell>
  );
}
