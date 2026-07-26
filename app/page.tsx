"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import WorldHeader from "@/src/components/world/WorldHeader";
import SectionIcon from "@/src/components/world/SectionIcon";
import { useWorld } from "@/src/context/WorldContext";
import { sections } from "@/src/data/world";

export default function HomePage() {
  const { isArabic, direction, playSound } = useWorld();

  return (
    <main dir={direction} className="home-world">
      <div className="background-orb background-orb-one" />
      <div className="background-orb background-orb-two" />

      <div className="home-frame">
        <WorldHeader />

        <section className="home-stage">
          <article className="hero-panel">
            <div className="hero-decoration hero-decoration-one" />
            <div className="hero-decoration hero-decoration-two" />

            <div className="hero-content">
              <span className="hero-badge">
                <Sparkles size={16} />
                {isArabic
                  ? "تعلّم • أبدع • شارك"
                  : "Learn • Create • Share"}
              </span>

              <h1>
                {isArabic ? (
                  <>
                    اللغة العربية
                    <span>عالم نعيش فيه</span>
                  </>
                ) : (
                  <>
                    Arabic Language
                    <span>A World We Live In</span>
                  </>
                )}
              </h1>

              <p>
                {isArabic
                  ? "منصة رقمية ثنائية اللغة تجمع رحلة التعلم، وإنجازات الطلاب، والفعاليات الثقافية، والمجلة الرقمية والموارد التعليمية في تجربة واحدة نابضة بالحياة."
                  : "A bilingual digital world bringing together learning, student achievement, cultural events, digital publishing and educational resources in one joyful experience."}
              </p>

              <div className="mascot-card">
                <div className="mascot">🦉</div>
                <div>
                  <strong>
                    {isArabic
                      ? "مرحبًا، أنا بيان!"
                      : "Hello, I’m Bayan!"}
                  </strong>
                  <span>
                    {isArabic
                      ? "اختر أيقونة لنبدأ رحلة عربية جديدة."
                      : "Choose an icon and begin a new Arabic adventure."}
                  </span>
                </div>
              </div>

              <div className="hero-tags">
                <span>{isArabic ? "تعليم عالمي" : "World-Class Learning"}</span>
                <span>{isArabic ? "هوية عربية" : "Arabic Identity"}</span>
                <span>{isArabic ? "إبداع طلابي" : "Student Creativity"}</span>
              </div>
            </div>
          </article>

          <article className="apps-panel">
            <div className="apps-heading">
              <div>
                <small>EXPLORE</small>
                <h2>
                  {isArabic ? "اختر وجهتك" : "Choose Your Destination"}
                </h2>
              </div>

              <Link
                href="/admin"
                className="admin-link"
                onMouseEnter={() => playSound("hover")}
                onClick={() => playSound("click")}
              >
                <ShieldCheck size={16} />
                {isArabic ? "الإدارة" : "Admin"}
              </Link>
            </div>

            <div className="apps-grid">
              {sections.map((section) => (
                <Link
                  key={section.slug}
                  href={`/${section.slug}`}
                  className="app-item"
                  onMouseEnter={() => playSound("hover")}
                  onClick={() => playSound("click")}
                >
                  <span
                    className={`app-icon bg-gradient-to-br ${section.gradient}`}
                  >
                    <span className="app-glow" />
                    <SectionIcon
                      name={section.icon}
                      className="app-svg"
                    />
                  </span>

                  <strong>{isArabic ? section.ar : section.en}</strong>
                  <small>{isArabic ? section.en : section.ar}</small>
                </Link>
              ))}
            </div>
          </article>
        </section>

        <footer className="home-footer">
          <span>King&apos;s College Doha — Arabic Department</span>
          <span>Powered by BAYAN</span>
        </footer>
      </div>
    </main>
  );
}
