import Link from "next/link";
import styles from "./pulse-main.module.css";

const channels = ["الكل","أخبار المدرسة","اللغة العربية","الفعاليات","الإنجازات","Arabic Bee","الفيديو","المجتمع"];

const stories = [
  { title: "صباح بيان", subtitle: "منذ 12 دقيقة", image: "/images/bayan/pulse-story-1.jpg" },
  { title: "داخل الصف", subtitle: "جديد", image: "/images/bayan/pulse-story-2.jpg" },
  { title: "Arabic Bee", subtitle: "اليوم", image: "/images/bayan/pulse-story-3.jpg" },
  { title: "إنجازات", subtitle: "6 قصص", image: "/images/bayan/pulse-story-4.jpg" },
  { title: "الفعاليات", subtitle: "هذا الأسبوع", image: "/images/bayan/pulse-story-5.jpg" },
  { title: "مجتمع بيان", subtitle: "جديد", image: "/images/bayan/pulse-story-6.jpg" },
];

export default function PulsePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.nav}`}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>ب</span>
            <span className={styles.brandText}>
              <strong>BAYAN Pulse</strong>
              <small>King&apos;s College Doha · Arabic Department</small>
            </span>
          </Link>

          <nav className={styles.navLinks}>
            <Link href="#today">إصدار اليوم</Link>
            <Link href="#stories">القصص</Link>
            <Link href="#events">الفعاليات</Link>
            <Link href="#achievements">الإنجازات</Link>
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.heroImage} src="/images/bayan/pulse-main-hero.jpg" alt="مجتمع المدرسة" />
          <span className={styles.liveBadge}><i className={styles.liveDot}/> نبض المدرسة الآن</span>

          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>THE LIVING SCHOOL</span>
            <h1>كل ما يحدث في بيان، يبدأ من هنا.</h1>
            <p>
              الواجهة الرئيسية للعائلة والمجتمع؛ أخبار، قصص، فعاليات، إنجازات وصور المدرسة في تجربة واحدة حيّة.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.heroPrimary} href="#today">اقرأ إصدار اليوم</Link>
              <Link className={styles.heroSecondary} href="/login">دخول العائلة</Link>
            </div>
          </div>
        </section>

        <section className={styles.channelsWrap} aria-label="قنوات نبض بيان">
          <div className={styles.channels}>
            {channels.map((channel, index) => (
              <button key={channel} className={`${styles.channel} ${index === 0 ? styles.channelActive : ""}`}>
                {channel}
              </button>
            ))}
          </div>
        </section>

        <section id="stories" className={styles.section}>
          <header className={styles.sectionHead}>
            <div><span>LIVE STORIES</span><h2>المشهد في دقيقة</h2></div>
            <p>صور حقيقية ولقطات سريعة تختصر أهم ما يحدث داخل المدرسة اليوم.</p>
          </header>

          <div className={styles.stories}>
            {stories.map((story) => (
              <button className={styles.story} key={story.title}>
                <span className={styles.storyRing}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={story.image} alt={story.title}/>
                </span>
                <strong>{story.title}</strong>
                <small>{story.subtitle}</small>
              </button>
            ))}
          </div>
        </section>

        <section id="today" className={styles.section}>
          <header className={styles.sectionHead}>
            <div><span>TODAY&apos;S EDITION</span><h2>إصدار اليوم</h2></div>
            <p>توزيع تحريري متنوع يمنح الخبر الأهم المساحة الأكبر، ثم يمزج الفيديو والصور والقصص.</p>
          </header>

          <div className={styles.editionGrid}>
            <article className={styles.lead}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/bayan/pulse-lead-real.jpg" alt="الخبر الرئيسي"/>
              <div className={styles.cardContent}>
                <span className={styles.tag}>العنوان الرئيسي</span>
                <h3>يوم جديد من التعلم والثقة والاحتفاء.</h3>
                <p>أبرز ما جرى داخل الصفوف والفعاليات ومجتمع المدرسة في إصدار واحد.</p>
              </div>
            </article>

            <div className={styles.sideStack}>
              <article className={styles.sideStory}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/bayan/pulse-side-real-1.jpg" alt="Arabic Bee"/>
                <div className={styles.cardContent}><span className={styles.tag}>Arabic Bee</span><h3>المنافسة تبدأ من كلمة.</h3></div>
              </article>
              <article className={styles.sideStory}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/bayan/pulse-side-real-2.jpg" alt="مجتمع المدرسة"/>
                <div className={styles.cardContent}><span className={styles.tag}>Community</span><h3>لحظات صغيرة، أثر كبير.</h3></div>
              </article>
            </div>
          </div>
        </section>

        <section id="achievements" className={styles.section}>
          <div className={styles.mosaic}>
            <article className={styles.videoCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/bayan/pulse-video-real.jpg" alt="فيديو اليوم"/>
              <div className={styles.cardContent}>
                <span className={styles.play}>▶</span>
                <span className={styles.tag}>90 SEC STORY</span>
                <h3>وراء كواليس يومنا.</h3>
                <p>فيديو قصير يلتقط التفاصيل التي لا تظهر في العناوين.</p>
              </div>
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
              <p>مشاريع وقصص وإبداعات طلابية في تجربة واحدة.</p>
            </article>

            <article className={styles.quoteCard}>
              <div className={styles.quoteMark}>“</div>
              <blockquote>اللغة لا تعلّمنا الكلمات فقط؛ إنها تمنحنا صوتًا وهوية وثقة.</blockquote>
              <footer>من مجتمع بيان</footer>
            </article>
          </div>
        </section>

        <section id="events" className={styles.section}>
          <header className={styles.sectionHead}>
            <div><span>COMING UP</span><h2>ما ينتظركم</h2></div>
            <p>الفعاليات مدمجة داخل إيقاع الصفحة، وليست قسمًا منفصلًا عن قصة اليوم.</p>
          </header>

          <div className={styles.timeline}>
            <div className={styles.timelineTabs}>
              <button className={`${styles.day} ${styles.dayActive}`}>اليوم</button>
              <button className={styles.day}>غدًا</button>
              <button className={styles.day}>هذا الأسبوع</button>
              <button className={styles.day}>هذا الشهر</button>
            </div>

            <div className={styles.timelineList}>
              {[
                ["08:00","تحدي Arabic Bee","المسرح الرئيسي","مباشر"],
                ["10:30","عرض مشاريع الطلاب","مركز التعلم","اليوم"],
                ["13:00","لقاء أولياء الأمور","قاعة المجتمع","قريبًا"],
              ].map(([time,title,place,status]) => (
                <article className={styles.timelineItem} key={title}>
                  <div className={styles.time}><strong>{time}</strong><small>صباحًا</small></div>
                  <div className={styles.timelineCopy}><h3>{title}</h3><p>{place}</p></div>
                  <span className={styles.status}>{status}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.brand}>
                <span className={styles.brandMark}>ب</span>
                <span className={styles.brandText}><strong>BAYAN Pulse</strong><small>Arabic Department · King&apos;s College Doha</small></span>
              </div>
              <p>الواجهة الرقمية الحية التي تجمع المدرسة والعائلة والمجتمع في تجربة واحدة واضحة وموثوقة.</p>
            </div>
            <div><h3>استكشف</h3><Link href="#today">إصدار اليوم</Link><Link href="#stories">القصص</Link><Link href="#events">الفعاليات</Link></div>
            <div><h3>المجتمع</h3><Link href="/achievements">الإنجازات</Link><Link href="/learn/arabic-b">Arabic B</Link><Link href="/login">دخول العائلة</Link></div>
            <div><h3>King&apos;s College Doha</h3><a href="https://www.kingscollegedoha.com/">الموقع الرسمي</a><a href="https://www.kingscollegedoha.com/our-campuses/">الحرم المدرسي</a></div>
          </div>
          <div className={styles.footerBottom}><span>© BAYAN Arabic World</span><span>Built for the King&apos;s College Doha community</span></div>
        </div>
      </footer>
    </main>
  );
}
