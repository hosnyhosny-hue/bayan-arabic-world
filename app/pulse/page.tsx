import Link from "next/link";
import styles from "./pulse-main.module.css";
import TimeAwareHero from "./components/TimeAwareHero";
import NewsTicker from "./components/NewsTicker";
import LiveCounters from "./components/LiveCounters";
import LiveStories from "./components/LiveStories";
import TodayEvents from "./components/TodayEvents";
import AISuggestions from "./components/AISuggestions";
import InfinitePulseFeed from "./components/InfinitePulseFeed";
import OfflineBanner from "./components/OfflineBanner";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";
import ProgressiveImage from "./components/ProgressiveImage";
import ChannelBar from "./components/ChannelBar";


export default function PulsePage() {
  return (
    <main className={styles.page}>
      <ServiceWorkerRegistration />
      <OfflineBanner />

      <header className={styles.header}>
        <div className={`${styles.container} ${styles.nav}`}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>ب</span>
            <span className={styles.brandText}><strong>BAYAN Pulse</strong><small>King&apos;s College Doha · Arabic Department</small></span>
          </Link>
          <nav className={styles.navLinks}>
            <Link href="#today">إصدار اليوم</Link><Link href="#stories">القصص</Link><Link href="#feed">النبض</Link><Link href="#events">الفعاليات</Link>
          </nav>
          <div className={styles.actions}>
            <button className={styles.iconBtn} aria-label="بحث">⌕</button>
            <Link href="#today" className={styles.ghostBtn}>استكشف النبض</Link>
            <Link href="/login" className={styles.familyBtn}>دخول العائلة</Link>
          </div>
        </div>
      </header>

      <NewsTicker />

      <div className={styles.container}>
        <TimeAwareHero />
        <LiveCounters />

        <section className={styles.channelsWrap}>
          <ChannelBar />
        </section>

        <section id="stories" className={styles.section}>
          <header className={styles.sectionHead}><div><span>LIVE STORIES</span><h2>المشهد في دقيقة</h2></div><p>قصص تتحدث تلقائيًا وتعرض أحدث ما يصل من المدرسة.</p></header>
          <LiveStories />
        </section>

        <section id="today" className={styles.section}>
          <header className={styles.sectionHead}><div><span>TODAY&apos;S EDITION</span><h2>إصدار اليوم</h2></div><p>العناوين والصور والقصص الأهم في توزيع تحريري متجدد.</p></header>
          <div className={styles.editionGrid}>
            <article className={styles.lead}>
              <ProgressiveImage src="/images/bayan/pulse-lead-real.jpg" alt="الخبر الرئيسي"/>
              <div className={styles.cardContent}><span className={styles.tag}>العنوان الرئيسي</span><h3>يوم جديد من التعلم والثقة والاحتفاء.</h3><p>أبرز ما جرى داخل الصفوف والفعاليات ومجتمع المدرسة في إصدار واحد.</p></div>
            </article>
            <div className={styles.sideStack}>
              <article className={styles.sideStory}><ProgressiveImage src="/images/bayan/pulse-side-real-1.jpg" alt="Arabic Bee"/><div className={styles.cardContent}><span className={styles.tag}>Arabic Bee</span><h3>المنافسة تبدأ من كلمة.</h3></div></article>
              <article className={styles.sideStory}><ProgressiveImage src="/images/bayan/pulse-side-real-2.jpg" alt="مجتمع المدرسة"/><div className={styles.cardContent}><span className={styles.tag}>Community</span><h3>لحظات صغيرة، أثر كبير.</h3></div></article>
            </div>
          </div>
        </section>

        <AISuggestions />

        <section id="feed" className={styles.section}>
          <header className={styles.sectionHead}><div><span>CONTINUOUS PULSE</span><h2>تابع النبض</h2></div><p>محتوى متجدد يُحمّل تدريجيًا ويستمر في الحياة أثناء تصفحك.</p></header>
          <InfinitePulseFeed />
        </section>

        <section id="events" className={styles.section}>
          <header className={styles.sectionHead}><div><span>TODAY LIVE</span><h2>فعاليات اليوم</h2></div><p>تظهر تلقائيًا حسب تاريخ اليوم، مع إبراز الفعالية الجارية الآن.</p></header>
          <TodayEvents />
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}><div className={styles.brand}><span className={styles.brandMark}>ب</span><span className={styles.brandText}><strong>BAYAN Pulse</strong><small>Arabic Department · King&apos;s College Doha</small></span></div><p>الواجهة الرقمية الحية التي تجمع المدرسة والعائلة والمجتمع في تجربة واحدة واضحة وموثوقة.</p></div>
            <div><h3>استكشف</h3><Link href="#today">إصدار اليوم</Link><Link href="#stories">القصص</Link><Link href="#feed">النبض</Link></div>
            <div><h3>المجتمع</h3><Link href="/achievements">الإنجازات</Link><Link href="/learn/arabic-b">Arabic B</Link><Link href="/login">دخول العائلة</Link></div>
            <div><h3>King&apos;s College Doha</h3><a href="https://www.kingscollegedoha.com/">الموقع الرسمي</a></div>
          </div>
          <div className={styles.footerBottom}><span>© BAYAN Arabic World</span><span>Built for the King&apos;s College Doha community</span></div>
        </div>
      </footer>
    </main>
  );
}
