import Link from "next/link";
import styles from "./pulse-main.module.css";
import polish from "./pulse-polish.module.css";
import ProgressiveImage from "./components/ProgressiveImage";
import OfflineBanner from "./components/OfflineBanner";
import InfinitePulseFeed from "./components/InfinitePulseFeed";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

const channels = ["الكل","أخبار المدرسة","اللغة العربية","الفعاليات","الإنجازات","Arabic Bee","الفيديو","المجتمع"];
const stories = [
  ["صباح بيان","منذ 12 دقيقة","/images/bayan/pulse-story-1.jpg"],
  ["داخل الصف","جديد","/images/bayan/pulse-story-2.jpg"],
  ["Arabic Bee","اليوم","/images/bayan/pulse-story-3.jpg"],
  ["إنجازات","6 قصص","/images/bayan/pulse-story-4.jpg"],
  ["الفعاليات","هذا الأسبوع","/images/bayan/pulse-story-5.jpg"],
  ["مجتمع بيان","جديد","/images/bayan/pulse-story-6.jpg"],
];

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

      <div className={styles.container}>
        <section className={styles.hero}>
          <ProgressiveImage src="/images/bayan/pulse-main-hero.jpg" alt="مجتمع المدرسة" className={styles.heroImage} priority />
          <span className={styles.liveBadge}><i className={styles.liveDot}/> نبض المدرسة الآن</span>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>THE LIVING SCHOOL</span>
            <h1>كل ما يحدث في بيان، يبدأ من هنا.</h1>
            <p>الواجهة الرئيسية للعائلة والمجتمع؛ أخبار، قصص، فعاليات، إنجازات وصور المدرسة في تجربة واحدة حيّة.</p>
            <div className={styles.heroActions}>
              <Link className={styles.heroPrimary} href="#today">اقرأ إصدار اليوم</Link>
              <Link className={styles.heroSecondary} href="/login">دخول العائلة</Link>
            </div>
          </div>
        </section>

        <section className={styles.channelsWrap}>
          <div className={styles.channels}>
            {channels.map((channel,index)=><button key={channel} className={`${styles.channel} ${index===0?styles.channelActive:""}`}>{channel}</button>)}
          </div>
        </section>

        <section id="stories" className={styles.section}>
          <header className={styles.sectionHead}><div><span>LIVE STORIES</span><h2>المشهد في دقيقة</h2></div><p>صور حقيقية ولقطات سريعة تختصر أهم ما يحدث داخل المدرسة اليوم.</p></header>
          <div className={styles.stories}>
            {stories.map(([title,subtitle,image])=>(
              <button className={styles.story} key={title}>
                <span className={styles.storyRing}><ProgressiveImage src={image} alt={title}/></span>
                <strong>{title}</strong><small>{subtitle}</small>
              </button>
            ))}
          </div>
        </section>

        <section id="today" className={styles.section}>
          <header className={styles.sectionHead}><div><span>TODAY&apos;S EDITION</span><h2>إصدار اليوم</h2></div><p>توزيع تحريري متنوع يمنح الخبر الأهم المساحة الأكبر، ثم يمزج الفيديو والصور والقصص.</p></header>
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

        <section id="feed" className={styles.section}>
          <header className={styles.sectionHead}><div><span>CONTINUOUS PULSE</span><h2>تابع النبض</h2></div><p>محتوى متجدد يُحمّل تدريجيًا أثناء التصفح دون إبطاء الصفحة.</p></header>
          <InfinitePulseFeed />
        </section>

        <section id="events" className={styles.section}>
          <header className={styles.sectionHead}><div><span>COMING UP</span><h2>ما ينتظركم</h2></div><p>الفعاليات والإنجازات جزء من إيقاع اليوم وليست صفحات منفصلة.</p></header>
          <div className={styles.timeline}>
            <div className={styles.timelineTabs}><button className={`${styles.day} ${styles.dayActive}`}>اليوم</button><button className={styles.day}>غدًا</button><button className={styles.day}>هذا الأسبوع</button></div>
            <div className={styles.timelineList}>
              {[["08:00","تحدي Arabic Bee","المسرح الرئيسي","مباشر"],["10:30","عرض مشاريع الطلاب","مركز التعلم","اليوم"],["13:00","لقاء أولياء الأمور","قاعة المجتمع","قريبًا"]].map(([time,title,place,status])=>(
                <article className={styles.timelineItem} key={title}><div className={styles.time}><strong>{time}</strong><small>صباحًا</small></div><div className={styles.timelineCopy}><h3>{title}</h3><p>{place}</p></div><span className={styles.status}>{status}</span></article>
              ))}
            </div>
          </div>
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
