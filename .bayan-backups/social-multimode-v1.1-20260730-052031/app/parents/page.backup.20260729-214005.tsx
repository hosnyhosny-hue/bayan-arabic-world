"use client";

import { useMemo, useState } from "react";
import styles from "./parents.module.css";

type Language = "ar" | "en";

const icons = {
  read: "📖",
  game: "🎲",
  speak: "🎙️",
  kitchen: "🍽️",
  car: "🚗",
  culture: "🌍",
};

const copy = {
  ar: {
    direction: "rtl",
    nav: {
      home: "الرئيسية",
      progress: "تقدّم أبنائي",
      activities: "أنشطة المنزل",
      academy: "أكاديمية الوالدين",
    },
    eyebrow: "BAYAN للعائلة",
    titleTop: "كل دقيقة في المنزل",
    titleAccent: "يمكن أن تغيّر مستقبل طفلك",
    subtitle:
      "منصة ذكية تساعدك على فهم مستوى طفلك، متابعة تقدمه، ودعم تعلم العربية بخطوات منزلية بسيطة ومخصصة.",
    start: "ابدأ رحلة الأسرة",
    explore: "استكشف لوحة المتابعة",
    trusted: "رحلة تعلم واحدة تجمع الطالب والأسرة والمعلم",
    dashboardTitle: "صباح الخير، عائلة أحمد",
    dashboardText: "هذه أهم مؤشرات رحلة أحمد التعليمية هذا الأسبوع.",
    weekly: "ملخص هذا الأسبوع",
    level: "المستوى الحالي",
    streak: "سلسلة التعلم",
    words: "كلمات جديدة",
    minutes: "دقائق قراءة",
    days: "أيام",
    progress: "تقدّم المهارات",
    reading: "القراءة",
    speaking: "التحدث",
    listening: "الاستماع",
    writing: "الكتابة",
    mission: "مهمة اليوم",
    missionText: "اقرؤوا قصة قصيرة معًا لمدة 10 دقائق.",
    missionButton: "ابدأ المهمة",
    journeyEyebrow: "مسار واضح",
    journeyTitle: "شاهد رحلة طفلك من البداية إلى الإتقان",
    journeyText:
      "يعرض بيان المرحلة الحالية، والخطوة التالية، وما يمكن للأسرة فعله لدعم التقدم.",
    journey: [
      "تحديد المستوى",
      "خطة التعلم",
      "المهام اليومية",
      "التقدم الأسبوعي",
      "المشروعات",
      "الشهادة",
    ],
    activitiesEyebrow: "العربية في الحياة",
    activitiesTitle: "حوّل المنزل إلى مساحة تعلم طبيعية",
    activitiesText:
      "أنشطة قصيرة وعملية تناسب وقت الأسرة، ولا تحتاج إلى إعداد مسبق.",
    activities: [
      ["اقرؤوا معًا", "قصة مناسبة لمستوى طفلك مع أسئلة بسيطة.", "read"],
      ["تحدي الكلمات", "لعبة عائلية لتعلّم خمس كلمات جديدة.", "game"],
      ["دقيقة التحدث", "موضوع يومي يساعد طفلك على بناء الثقة.", "speak"],
      ["العربية في المطبخ", "استخدموا أسماء الطعام والأفعال أثناء الطبخ.", "kitchen"],
      ["حديث السيارة", "أسئلة خفيفة للمحادثة في الطريق.", "car"],
      ["نافذة الثقافة", "اكتشفوا قصة أو عادة من العالم العربي.", "culture"],
    ],
    coachEyebrow: "BAYAN AI",
    coachTitle: "مساعد تربوي شخصي لكل أسرة",
    coachText:
      "اكتب ما يواجهه طفلك، وسيقترح بيان خطوات عملية تناسب عمره ومستواه.",
    coachPlaceholder: "مثال: ابني يفهم العربية لكنه يخجل من التحدث...",
    coachPrompt: "ابنتي تحتاج إلى تحسين الإملاء.",
    coachResponse:
      "ابدؤوا بثلاث كلمات يوميًا. انطقوا الكلمة، استخدموها في جملة، ثم اطلبوا منها كتابتها دون نسخ. سأجهز لكم خطة من 7 أيام.",
    send: "إرسال",
    reportEyebrow: "تقرير ذكي",
    reportTitle: "افهم التقدم، لا تكتفِ بالأرقام",
    reportText:
      "يحوّل بيان بيانات التعلم إلى ملاحظات واضحة وخطوات عملية للأسرة.",
    insightTitle: "أبرز ملاحظة",
    insight:
      "تحسّن أحمد في القراءة الجهرية، ويحتاج الآن إلى وقت أكبر في المحادثة الحرة.",
    recommendation: "توصية هذا الأسبوع",
    recommendationText:
      "اسألوه كل مساء عن أفضل شيء حدث في يومه، وامنحوه دقيقتين للإجابة بالعربية.",
    teacher: "رسالة المعلمة",
    teacherText:
      "أحمد أظهر ثقة أكبر أثناء النشاط الجماعي. استمروا في تشجيعه على وصف يومه.",
    academyEyebrow: "أكاديمية الوالدين",
    academyTitle: "تعلم كيف تدعم طفلك بثقة",
    academyText:
      "دروس قصيرة وعملية تساعد الأسر على بناء عادات لغوية مستدامة.",
    courses: [
      ["بناء عادة القراءة", "8 دقائق", "كيف تجعل القراءة نشاطًا عائليًا محببًا."],
      ["تصحيح الأخطاء بلطف", "6 دقائق", "طرق تحافظ على ثقة الطفل ورغبته في الكلام."],
      ["العربية لغير الناطقين بها", "10 دقائق", "كيف تدعم التعلم حتى إن لم تكن تتحدث العربية."],
    ],
    communityTitle: "لأن التعلم رحلة عائلية",
    communityText:
      "انضم إلى تحديات القراءة، اللقاءات المباشرة، ومجتمع عالمي من أولياء الأمور.",
    communityButton: "انضم إلى مجتمع BAYAN",
    footerText:
      "منصة عالمية تجعل الأسرة شريكًا حقيقيًا في رحلة تعلم اللغة العربية.",
  },
  en: {
    direction: "ltr",
    nav: {
      home: "Home",
      progress: "Child Progress",
      activities: "Home Activities",
      academy: "Parent Academy",
    },
    eyebrow: "BAYAN for Families",
    titleTop: "Every minute at home",
    titleAccent: "can change a child's future",
    subtitle:
      "An intelligent platform that helps you understand your child's level, follow progress, and support Arabic learning through simple personalised steps.",
    start: "Start Family Journey",
    explore: "Explore Dashboard",
    trusted: "One learning journey connecting student, family and teacher",
    dashboardTitle: "Good morning, Ahmed's family",
    dashboardText: "Here are Ahmed's most important learning signals this week.",
    weekly: "This Week",
    level: "Current Level",
    streak: "Learning Streak",
    words: "New Words",
    minutes: "Reading Minutes",
    days: "days",
    progress: "Skill Progress",
    reading: "Reading",
    speaking: "Speaking",
    listening: "Listening",
    writing: "Writing",
    mission: "Today's Mission",
    missionText: "Read a short story together for 10 minutes.",
    missionButton: "Start Mission",
    journeyEyebrow: "A Clear Path",
    journeyTitle: "See the journey from first step to mastery",
    journeyText:
      "BAYAN shows the current stage, the next milestone, and what the family can do to support progress.",
    journey: [
      "Placement",
      "Learning Plan",
      "Daily Missions",
      "Weekly Progress",
      "Projects",
      "Certificate",
    ],
    activitiesEyebrow: "Arabic in Real Life",
    activitiesTitle: "Turn home into a natural learning space",
    activitiesText:
      "Short, practical activities designed for busy families with no preparation required.",
    activities: [
      ["Read Together", "A level-appropriate story with simple questions.", "read"],
      ["Word Challenge", "A family game to learn five new words.", "game"],
      ["Speaking Minute", "A daily topic that builds confidence.", "speak"],
      ["Kitchen Arabic", "Use food names and action words while cooking.", "kitchen"],
      ["Car Conversations", "Light conversation prompts for the journey.", "car"],
      ["Culture Window", "Discover a story or tradition from the Arab world.", "culture"],
    ],
    coachEyebrow: "BAYAN AI",
    coachTitle: "A personal education coach for every family",
    coachText:
      "Tell BAYAN what your child is finding difficult and receive practical steps tailored to age and level.",
    coachPlaceholder: "Example: My son understands Arabic but is shy to speak...",
    coachPrompt: "My daughter needs to improve her spelling.",
    coachResponse:
      "Start with three words a day. Say each word, use it in a sentence, then ask her to write it without copying. I can prepare a seven-day plan.",
    send: "Send",
    reportEyebrow: "Intelligent Reporting",
    reportTitle: "Understand progress, not only numbers",
    reportText:
      "BAYAN turns learning data into clear insights and practical family actions.",
    insightTitle: "Key Insight",
    insight:
      "Ahmed has improved in reading aloud and now needs more time for spontaneous conversation.",
    recommendation: "This Week's Recommendation",
    recommendationText:
      "Each evening, ask him about the best part of his day and give him two minutes to answer in Arabic.",
    teacher: "Teacher Message",
    teacherText:
      "Ahmed showed greater confidence during group work. Please continue encouraging him to describe his day.",
    academyEyebrow: "Parent Academy",
    academyTitle: "Learn how to support your child confidently",
    academyText:
      "Short practical lessons that help families build sustainable language habits.",
    courses: [
      ["Building a Reading Habit", "8 min", "Make reading an enjoyable family routine."],
      ["Correcting with Care", "6 min", "Protect confidence while improving accuracy."],
      ["Arabic for Non-Arabic Parents", "10 min", "Support learning even when you do not speak Arabic."],
    ],
    communityTitle: "Because learning is a family journey",
    communityText:
      "Join reading challenges, live events and a global community of parents.",
    communityButton: "Join the BAYAN Community",
    footerText:
      "A global platform making families true partners in Arabic language learning.",
  },
} as const;

export default function ParentsPage() {
  const [language, setLanguage] = useState<Language>("ar");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const content = copy[language];

  const skillData = useMemo(
    () => [
      [content.reading, 82],
      [content.speaking, 64],
      [content.listening, 88],
      [content.writing, 71],
    ],
    [content]
  );

  function sendMessage() {
    const value = message.trim();
    if (!value) return;
    setChat([value, content.coachResponse]);
    setMessage("");
  }

  return (
    <main
      className={styles.page}
      dir={content.direction}
      lang={language}
    >
      <header className={styles.header}>
        <a href="/" className={styles.brand} aria-label="BAYAN home">
          <span className={styles.brandMark}>ب</span>
          <span>
            <strong>BAYAN</strong>
            <small>Arabic World</small>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Parents navigation">
          <a href="#home">{content.nav.home}</a>
          <a href="#progress">{content.nav.progress}</a>
          <a href="#activities">{content.nav.activities}</a>
          <a href="#academy">{content.nav.academy}</a>
        </nav>

        <button
          className={styles.languageButton}
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          type="button"
        >
          {language === "ar" ? "English" : "العربية"}
        </button>
      </header>

      <section className={styles.hero} id="home">
        <div className={styles.heroGlowOne} />
        <div className={styles.heroGlowTwo} />
        <div className={styles.heroPattern} />

        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            {content.eyebrow}
          </div>

          <h1>
            <span>{content.titleTop}</span>
            <strong>{content.titleAccent}</strong>
          </h1>

          <p>{content.subtitle}</p>

          <div className={styles.heroButtons}>
            <a className={styles.primaryButton} href="#progress">
              {content.start}
              <span aria-hidden="true">←</span>
            </a>
            <a className={styles.secondaryButton} href="#dashboard">
              <span className={styles.playIcon}>▶</span>
              {content.explore}
            </a>
          </div>

          <div className={styles.trustLine}>
            <div className={styles.avatars} aria-hidden="true">
              <span>أ</span>
              <span>م</span>
              <span>س</span>
              <span>ل</span>
            </div>
            <span>{content.trusted}</span>
          </div>
        </div>

        <div className={styles.heroVisual} id="dashboard">
          <div className={styles.floatingBadge}>
            <span>↗</span>
            <div>
              <strong>+12%</strong>
              <small>{content.weekly}</small>
            </div>
          </div>

          <div className={styles.dashboard}>
            <div className={styles.dashboardTop}>
              <div className={styles.childProfile}>
                <div className={styles.childAvatar}>أ</div>
                <div>
                  <strong>{content.dashboardTitle}</strong>
                  <span>{content.dashboardText}</span>
                </div>
              </div>
              <button type="button" aria-label="Notifications">
                🔔
              </button>
            </div>

            <div className={styles.metricGrid}>
              <article>
                <span>{content.level}</span>
                <strong>B1</strong>
                <small>CEFR</small>
              </article>
              <article>
                <span>{content.streak}</span>
                <strong>14</strong>
                <small>{content.days}</small>
              </article>
              <article>
                <span>{content.words}</span>
                <strong>82</strong>
                <small>+18%</small>
              </article>
              <article>
                <span>{content.minutes}</span>
                <strong>45</strong>
                <small>+12%</small>
              </article>
            </div>

            <div className={styles.skillsCard}>
              <div className={styles.cardHeading}>
                <strong>{content.progress}</strong>
                <span>{content.weekly}</span>
              </div>

              {skillData.map(([skill, value]) => (
                <div className={styles.skillRow} key={skill}>
                  <div>
                    <span>{skill}</span>
                    <strong>{value}%</strong>
                  </div>
                  <div className={styles.progressTrack}>
                    <span style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>✨</div>
              <div>
                <span>{content.mission}</span>
                <strong>{content.missionText}</strong>
              </div>
              <button type="button">{content.missionButton}</button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="progress">
        <div className={styles.sectionIntro}>
          <span>{content.journeyEyebrow}</span>
          <h2>{content.journeyTitle}</h2>
          <p>{content.journeyText}</p>
        </div>

        <div className={styles.journey}>
          {content.journey.map((item, index) => (
            <article
              className={`${styles.journeyStep} ${
                index < 3 ? styles.journeyActive : ""
              }`}
              key={item}
            >
              <div className={styles.stepNumber}>
                {index < 3 ? "✓" : index + 1}
              </div>
              <strong>{item}</strong>
              {index !== content.journey.length - 1 && (
                <span className={styles.stepLine} />
              )}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.activitiesSection} id="activities">
        <div className={styles.sectionIntro}>
          <span>{content.activitiesEyebrow}</span>
          <h2>{content.activitiesTitle}</h2>
          <p>{content.activitiesText}</p>
        </div>

        <div className={styles.activityGrid}>
          {content.activities.map(([title, text, icon]) => (
            <article className={styles.activityCard} key={title}>
              <div className={styles.activityIcon}>
                {icons[icon as keyof typeof icons]}
              </div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <button type="button" aria-label={title}>
                ↗
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.coachSection}>
        <div className={styles.coachCopy}>
          <span>{content.coachEyebrow}</span>
          <h2>{content.coachTitle}</h2>
          <p>{content.coachText}</p>

          <div className={styles.coachBenefits}>
            <div>
              <i>✓</i>
              <span>Personalised family guidance</span>
            </div>
            <div>
              <i>✓</i>
              <span>Age and level appropriate</span>
            </div>
            <div>
              <i>✓</i>
              <span>Practical weekly action plans</span>
            </div>
          </div>
        </div>

        <div className={styles.chatCard}>
          <div className={styles.chatHeader}>
            <div className={styles.aiAvatar}>ب</div>
            <div>
              <strong>BAYAN AI Coach</strong>
              <span>
                <i /> Online
              </span>
            </div>
            <span className={styles.sparkle}>✦</span>
          </div>

          <div className={styles.chatBody}>
            <div className={styles.aiMessage}>{content.coachText}</div>

            {chat.length === 0 ? (
              <button
                className={styles.suggestion}
                type="button"
                onClick={() => setMessage(content.coachPrompt)}
              >
                {content.coachPrompt}
              </button>
            ) : (
              <>
                <div className={styles.userMessage}>{chat[0]}</div>
                <div className={styles.aiMessage}>{chat[1]}</div>
              </>
            )}
          </div>

          <div className={styles.chatInput}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder={content.coachPlaceholder}
              aria-label={content.coachPlaceholder}
            />
            <button type="button" onClick={sendMessage}>
              {content.send}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.reportSection}>
        <div className={styles.sectionIntro}>
          <span>{content.reportEyebrow}</span>
          <h2>{content.reportTitle}</h2>
          <p>{content.reportText}</p>
        </div>

        <div className={styles.reportGrid}>
          <article className={styles.mainInsight}>
            <div className={styles.insightTop}>
              <div>
                <span>{content.insightTitle}</span>
                <strong>Weekly Insight</strong>
              </div>
              <div className={styles.insightScore}>82%</div>
            </div>
            <p>{content.insight}</p>
            <div className={styles.miniChart}>
              {[38, 48, 44, 62, 58, 76, 82].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </article>

          <article className={styles.recommendationCard}>
            <div className={styles.reportIcon}>💡</div>
            <span>{content.recommendation}</span>
            <p>{content.recommendationText}</p>
            <button type="button">View action plan →</button>
          </article>

          <article className={styles.teacherCard}>
            <div className={styles.teacherTop}>
              <div className={styles.teacherAvatar}>ن</div>
              <div>
                <span>{content.teacher}</span>
                <strong>Ms Nora</strong>
              </div>
            </div>
            <p>“{content.teacherText}”</p>
            <small>Today · 09:30</small>
          </article>
        </div>
      </section>

      <section className={styles.academySection} id="academy">
        <div className={styles.sectionIntro}>
          <span>{content.academyEyebrow}</span>
          <h2>{content.academyTitle}</h2>
          <p>{content.academyText}</p>
        </div>

        <div className={styles.courseGrid}>
          {content.courses.map(([title, duration, text], index) => (
            <article className={styles.courseCard} key={title}>
              <div className={styles.courseVisual}>
                <span>0{index + 1}</span>
                <button type="button" aria-label={`Play ${title}`}>
                  ▶
                </button>
              </div>
              <div className={styles.courseContent}>
                <small>{duration}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.community}>
        <div className={styles.communityPattern} />
        <div>
          <span>GLOBAL BAYAN COMMUNITY</span>
          <h2>{content.communityTitle}</h2>
          <p>{content.communityText}</p>
        </div>
        <a href="#home">{content.communityButton}</a>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className={styles.brandMark}>ب</div>
          <div>
            <strong>BAYAN Arabic World</strong>
            <p>{content.footerText}</p>
          </div>
        </div>

        <div className={styles.footerLinks}>
          <a href="/students">Students</a>
          <a href="/learn/arabic-a">Arabic A</a>
          <a href="/learn/arabic-b">Arabic B</a>
          <a href="/teachers">Teachers</a>
        </div>

        <small>© {new Date().getFullYear()} BAYAN Arabic World</small>
      </footer>
    </main>
  );
}
