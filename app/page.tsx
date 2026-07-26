"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  GraduationCap,
  Heart,
  Languages,
  MessageCircle,
  Newspaper,
  Palette,
  Play,
  Sparkles,
  Star,
  Trophy,
  Users,
  WandSparkles,
} from "lucide-react";
import PublicHeader from "../src/components/public/PublicHeader";
import Reveal from "../src/components/motion/Reveal";
import { useLanguage } from "../src/context/LanguageContext";
import { useSound } from "../src/context/SoundContext";
import { siteContent } from "../src/data/site-content";

export default function Home() {
  const { language, direction } = useLanguage();
  const {
    playHover,
    playClick,
    playSuccess,
  } = useSound();

  const isArabic = language === "ar";
  const Arrow = isArabic ? ArrowLeft : ArrowRight;

  const t = {
    badge: isArabic
      ? "عالم العربية في كينجز كولج الدوحة"
      : "Arabic at King's College Doha",
    title1: isArabic ? "العربية" : "Arabic",
    title2: isArabic
      ? "رحلة مليئة بالاكتشاف"
      : "A journey full of discovery",
    intro: isArabic
      ? "مكان رقمي آمن ومرح يجمع تعلم الطلاب، وإبداعاتهم، وإنجازات القسم، ويمنح أولياء الأمور نافذة واضحة على رحلة أبنائهم."
      : "A safe and joyful digital world bringing together student learning, creativity and department achievements, while giving parents a clear view of their child's journey.",
    start: isArabic ? "ابدأ رحلة التعلم" : "Start Learning",
    parents: isArabic ? "استكشف بوابة الأسرة" : "Explore Parent Hub",
    pathways: isArabic ? "مساران يناسبان كل طالب" : "A Path for Every Learner",
    pathwaysText: isArabic
      ? "رحلات تعليم مصممة بعناية للناطقين بالعربية ولمن يتعلمونها كلغة إضافية."
      : "Carefully designed journeys for native speakers and students learning Arabic as an additional language.",
    highlights: isArabic ? "ماذا يحدث هذا الأسبوع؟" : "What's Happening This Week?",
    newsletter: isArabic ? "النشرة الأسبوعية" : "Weekly Newsletter",
    achievements: isArabic ? "إنجازات نفتخر بها" : "Achievements We Celebrate",
    activities: isArabic ? "أنشطة تصنع الذكريات" : "Activities That Create Memories",
    family: isArabic ? "معًا لدعم تعلم طفلك" : "Supporting Your Child Together",
    familyText: isArabic
      ? "تابع ما يتعلمه طفلك، واحصل على مصادر منزلية بسيطة، واكتشف الفعاليات القادمة."
      : "Follow your child's learning, access simple home resources and discover upcoming activities.",
    explore: isArabic ? "اكتشف المزيد" : "Explore More",
  };

  const learningFeatures = [
    {
      ar: "تحدث بثقة",
      en: "Speak Confidently",
      icon: MessageCircle,
      color: "bg-[#E9F8FF] text-[#1689B4]",
    },
    {
      ar: "اقرأ واستكشف",
      en: "Read & Discover",
      icon: BookOpen,
      color: "bg-[#EAF8F0] text-[#0B6B49]",
    },
    {
      ar: "اكتب وأبدع",
      en: "Write & Create",
      icon: Palette,
      color: "bg-[#FFF0E1] text-[#E86D00]",
    },
    {
      ar: "احتفِ بثقافتك",
      en: "Celebrate Culture",
      icon: Heart,
      color: "bg-[#FFEAF2] text-[#D83D75]",
    },
  ];

  return (
    <main
      dir={direction}
      className="min-h-screen overflow-hidden bg-[#FFFDF7] text-[#21312A]"
    >
      <PublicHeader />

      <section className="relative mx-auto max-w-[1500px] px-4 pb-12 pt-5">
        <div className="playful-grid relative overflow-hidden rounded-[44px] border border-[#0B6B49]/8 bg-gradient-to-br from-[#E9FBF2] via-[#FFF9E8] to-[#FFF0E2] px-6 py-10 shadow-[0_30px_90px_rgba(52,103,77,0.13)] sm:px-10 lg:min-h-[660px] lg:px-16 lg:py-16">
          <div className="floating-shape absolute -left-20 top-16 h-52 w-52 rounded-[42%_58%_65%_35%] bg-[#FFB648]/25" />
          <div className="floating-shape-delayed absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#29B87E]/18" />
          <div className="absolute bottom-[-90px] left-[38%] h-64 w-64 rounded-full bg-[#84D8FF]/18" />

          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <Reveal>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#0B6B49]/10 bg-white/80 px-4 py-2 text-xs font-bold text-[#0B6B49] shadow-sm backdrop-blur">
                  <Sparkles size={16} className="text-[#FF8A00]" />
                  {t.badge}
                </span>

                <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.13] text-[#123C2D] sm:text-6xl lg:text-7xl">
                  <span className="text-[#11A96F]">{t.title1}</span>
                  <br />
                  {t.title2}
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-[#5B6D65] sm:text-lg">
                  {t.intro}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/student"
                    onPointerEnter={playHover}
                    onClick={() => {
                      playClick();
                      playSuccess();
                    }}
                    className="group inline-flex items-center gap-3 rounded-2xl border-b-[6px] border-[#08774F] bg-[#14B879] px-6 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(20,184,121,0.25)] transition hover:-translate-y-1"
                  >
                    <GraduationCap size={22} />
                    {t.start}
                    <Arrow
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    href="/parent"
                    onPointerEnter={playHover}
                    onClick={playClick}
                    className="group inline-flex items-center gap-3 rounded-2xl border-2 border-[#0B6B49]/10 bg-white px-6 py-4 text-sm font-bold text-[#0B6B49] shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <Users size={21} />
                    {t.parents}
                  </Link>
                </div>

                <div className="mt-9 flex flex-wrap gap-3">
                  {learningFeatures.map(({ ar, en, icon: Icon, color }) => (
                    <div
                      key={en}
                      onPointerEnter={playHover}
                      className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2.5 text-xs font-semibold shadow-sm backdrop-blur transition hover:-translate-y-1"
                    >
                      <span className={`rounded-xl p-2 ${color}`}>
                        <Icon size={16} />
                      </span>
                      {isArabic ? ar : en}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="relative mx-auto min-h-[500px] w-full max-w-[520px]">
                <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#BDF1D9]" />
                <div className="absolute left-[10%] top-[11%] h-20 w-20 rounded-[28px] bg-[#FFB648] shadow-lg">
                  <Star
                    size={35}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-white text-white"
                  />
                </div>
                <div className="absolute right-[4%] top-[21%] h-16 w-16 rounded-full bg-[#80D9FF] shadow-lg">
                  <Languages
                    size={29}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
                  />
                </div>

                <div className="absolute left-1/2 top-1/2 flex h-[330px] w-[290px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[48%_52%_43%_57%] border-[10px] border-white bg-[#14B879] shadow-[0_28px_60px_rgba(20,184,121,0.30)]">
                  <div className="flex gap-14">
                    <span className="h-8 w-7 rounded-full bg-white">
                      <span className="mx-auto mt-2 block h-3 w-3 rounded-full bg-[#173D30]" />
                    </span>
                    <span className="h-8 w-7 rounded-full bg-white">
                      <span className="mx-auto mt-2 block h-3 w-3 rounded-full bg-[#173D30]" />
                    </span>
                  </div>

                  <div className="mt-7 h-10 w-20 rounded-b-full border-b-[7px] border-white" />

                  <div className="mt-8 rounded-full bg-white/18 px-5 py-2 text-sm font-bold text-white">
                    {isArabic ? "مرحبًا! أنا بيان" : "Hello! I'm Bayan"}
                  </div>
                </div>

                <div className="absolute bottom-[5%] left-[2%] rounded-[24px] bg-white p-4 shadow-[0_14px_35px_rgba(34,80,59,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0E1] text-[#E86D00]">
                      <Trophy size={22} />
                    </span>
                    <div>
                      <p className="text-xs text-[#718078]">
                        {isArabic ? "تحدي اليوم" : "Today's Challenge"}
                      </p>
                      <p className="font-bold">
                        {isArabic ? "5 كلمات جديدة" : "5 New Words"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-[16%] right-[-4%] rounded-[24px] bg-white p-4 shadow-[0_14px_35px_rgba(34,80,59,0.14)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFEAF2] text-[#D83D75]">
                      <Heart size={22} />
                    </span>
                    <div>
                      <p className="text-xs text-[#718078]">
                        {isArabic ? "سلسلة التعلم" : "Learning Streak"}
                      </p>
                      <p className="font-bold">
                        {isArabic ? "7 أيام" : "7 Days"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-14">
        <Reveal>
          <div className="mb-7 text-center">
            <p className="text-sm font-bold text-[#FF7A00]">
              Arabic A & Arabic B
            </p>
            <h2 className="mt-2 text-4xl font-bold text-[#123C2D]">
              {t.pathways}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl leading-7 text-[#687970]">
              {t.pathwaysText}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Link
              href="/learn/arabic-a"
              onPointerEnter={playHover}
              onClick={playClick}
              className="group relative overflow-hidden rounded-[36px] border border-[#0B6B49]/8 bg-[#EAF8F0] p-8 transition hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(11,107,73,0.16)]"
            >
              <div className="absolute -right-14 -top-16 h-52 w-52 rounded-full bg-[#11A96F]/12" />

              <div className="relative z-10">
                <span className="flex h-16 w-16 items-center justify-center rounded-[22px] border-b-4 border-[#08774F] bg-[#14B879] text-white">
                  <BookOpen size={30} />
                </span>

                <p className="mt-6 text-sm font-bold text-[#0B6B49]">
                  Arabic A
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  {isArabic
                    ? "العربية للناطقين بها"
                    : "For Native Arabic Speakers"}
                </h3>
                <p className="mt-4 max-w-xl leading-8 text-[#607068]">
                  {isArabic
                    ? "قراءة وأدب وكتابة وتفكير نقدي في رحلة أكاديمية غنية."
                    : "Reading, literature, writing and critical thinking through a rich academic journey."}
                </p>

                <span className="mt-7 flex items-center gap-2 font-bold text-[#0B6B49]">
                  {t.explore}
                  <Arrow className="transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <Link
              href="/learn/arabic-b"
              onPointerEnter={playHover}
              onClick={playClick}
              className="group relative overflow-hidden rounded-[36px] border border-[#FF941F]/15 bg-[#FFF0E1] p-8 transition hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(232,109,0,0.16)]"
            >
              <div className="absolute -right-14 -top-16 h-52 w-52 rounded-full bg-[#FF941F]/15" />

              <div className="relative z-10">
                <span className="flex h-16 w-16 items-center justify-center rounded-[22px] border-b-4 border-[#D66A00] bg-[#FF941F] text-white">
                  <MessageCircle size={30} />
                </span>

                <p className="mt-6 text-sm font-bold text-[#E56D00]">
                  Arabic B
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  {isArabic
                    ? "العربية لغير الناطقين بها"
                    : "For Non-Native Arabic Speakers"}
                </h3>
                <p className="mt-4 max-w-xl leading-8 text-[#74685E]">
                  {isArabic
                    ? "استماع ومحادثة ومفردات وتواصل عملي لبناء الثقة والمتعة."
                    : "Listening, speaking and practical vocabulary designed to build confidence and enjoyment."}
                </p>

                <span className="mt-7 flex items-center gap-2 font-bold text-[#E56D00]">
                  {t.explore}
                  <Arrow className="transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="bg-[#F2FBF6] py-14">
        <div className="mx-auto max-w-[1500px] px-4">
          <Reveal>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#FF7A00]">
                  This Week at Arabic
                </p>
                <h2 className="mt-2 text-4xl font-bold text-[#123C2D]">
                  {t.highlights}
                </h2>
              </div>

              <Link
                href="/newsletters"
                onPointerEnter={playHover}
                onClick={playClick}
                className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#0B6B49] shadow-sm"
              >
                {t.explore}
                <Arrow size={17} />
              </Link>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <Link
                href="/newsletters"
                onPointerEnter={playHover}
                onClick={playClick}
                className="group rounded-[32px] bg-white p-6 shadow-[0_15px_45px_rgba(52,103,77,0.09)] transition hover:-translate-y-2"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9F8FF] text-[#1689B4]">
                  <Newspaper size={27} />
                </span>
                <h3 className="mt-5 text-2xl font-bold">{t.newsletter}</h3>
                <p className="mt-3 leading-7 text-[#687970]">
                  {isArabic
                    ? siteContent.weeklyNewsletter.summaryAr
                    : siteContent.weeklyNewsletter.summaryEn}
                </p>
              </Link>

              <Link
                href="/achievements"
                onPointerEnter={playHover}
                onClick={playSuccess}
                className="group rounded-[32px] bg-white p-6 shadow-[0_15px_45px_rgba(52,103,77,0.09)] transition hover:-translate-y-2"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4DA] text-[#E79B00]">
                  <Trophy size={27} />
                </span>
                <h3 className="mt-5 text-2xl font-bold">{t.achievements}</h3>
                <p className="mt-3 leading-7 text-[#687970]">
                  {isArabic
                    ? siteContent.achievements[0].descriptionAr
                    : siteContent.achievements[0].descriptionEn}
                </p>
              </Link>

              <Link
                href="/events"
                onPointerEnter={playHover}
                onClick={playClick}
                className="group rounded-[32px] bg-white p-6 shadow-[0_15px_45px_rgba(52,103,77,0.09)] transition hover:-translate-y-2"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFEAF2] text-[#D83D75]">
                  <CalendarDays size={27} />
                </span>
                <h3 className="mt-5 text-2xl font-bold">{t.activities}</h3>
                <p className="mt-3 leading-7 text-[#687970]">
                  {isArabic
                    ? siteContent.events[0].descriptionAr
                    : siteContent.events[0].descriptionEn}
                </p>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[42px] bg-[#143E31] px-7 py-12 text-white sm:px-12 lg:px-16">
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#14B879]/20" />
            <div className="absolute -bottom-28 right-20 h-64 w-64 rounded-full bg-[#FF941F]/18" />

            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                  <Users size={16} />
                  Parent Partnership
                </span>

                <h2 className="mt-5 text-4xl font-bold">{t.family}</h2>
                <p className="mt-4 max-w-3xl leading-8 text-white/75">
                  {t.familyText}
                </p>
              </div>

              <Link
                href="/parent"
                onPointerEnter={playHover}
                onClick={playClick}
                className="inline-flex items-center justify-center gap-3 rounded-2xl border-b-4 border-[#D66A00] bg-[#FF941F] px-6 py-4 font-bold shadow-xl transition hover:-translate-y-1"
              >
                {t.parents}
                <Arrow size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[#0B6B49]/8 bg-white py-8">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 text-xs font-semibold text-[#687970]">
          <span>King&apos;s College Doha</span>
          <span>Arabic Department Digital World</span>
          <span>Powered by BAYAN</span>
        </div>
      </footer>
    </main>
  );
}
