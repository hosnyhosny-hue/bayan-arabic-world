"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Camera,
  GraduationCap,
  Newspaper,
  PlayCircle,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import PublicHeader from "../src/components/public/PublicHeader";
import Reveal from "../src/components/motion/Reveal";
import { useLanguage } from "../src/context/LanguageContext";
import { useSound } from "../src/context/SoundContext";
import { siteContent } from "../src/data/site-content";

export default function Home() {
  const { language, direction } = useLanguage();
  const { playClick, playSuccess } = useSound();

  const isArabic = language === "ar";
  const Arrow = isArabic ? ArrowLeft : ArrowRight;
  const { achievements, events, weeklyNewsletter } = siteContent;

  const text = {
    heroLabel: isArabic
      ? "قسم اللغة العربية – كلية كينجز الدوحة"
      : "Arabic Department – King's College Doha",
    title: isArabic
      ? "نُلهم اللغة، ونبني الهوية، ونحتفي بالإبداع"
      : "Inspiring Language, Building Identity, Celebrating Creativity",
    intro: isArabic
      ? "بوابة رقمية تجمع تعلم الطلاب، ودعم أولياء الأمور، وإنجازات القسم، والأنشطة الثقافية، والنشرة الأسبوعية في تجربة حديثة نابضة بالحياة."
      : "A vibrant digital portal bringing together student learning, parent support, department achievements, cultural activities and the weekly newsletter.",
    students: isArabic ? "بوابة الطلاب" : "Student Hub",
    parents: isArabic ? "بوابة أولياء الأمور" : "Parent Hub",
    newsletter: isArabic ? "النشرة الأسبوعية" : "Weekly Newsletter",
    achievements: isArabic ? "إنجازات القسم" : "Department Achievements",
    activities: isArabic ? "أنشطة وفعاليات القسم" : "Activities and Events",
    moments: isArabic ? "لحظات من قسم اللغة العربية" : "Moments from Arabic",
    viewAll: isArabic ? "عرض المزيد" : "View More",
  };

  return (
    <main
      dir={direction}
      className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#EAF8F0_0%,#FFF9EF_42%,#F7EEDC_100%)] text-[#22312A]"
    >
      <PublicHeader />

      <section className="mx-auto max-w-[1500px] px-4 pb-10 pt-5">
        <div className="relative min-h-[610px] overflow-hidden rounded-[42px] bg-[#07533B] shadow-[0_34px_90px_rgba(11,107,73,0.26)]">
          <Image
            src="/media/hero-department.svg"
            alt=""
            fill
            priority
            className="object-cover opacity-55 transition duration-[1800ms] hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#063E2E]/92 via-[#07533B]/78 to-[#07533B]/40" />

          <div className="relative z-10 grid min-h-[610px] items-center gap-10 px-7 py-12 sm:px-12 lg:grid-cols-[1fr_390px] lg:px-16">
            <Reveal>
              <div className="text-white">
                <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black backdrop-blur">
                  {text.heroLabel}
                </span>

                <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.22] sm:text-5xl lg:text-6xl">
                  {text.title}
                </h1>

                <p className="mt-6 max-w-3xl text-base leading-8 text-white/82">
                  {text.intro}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/student"
                    onClick={() => {
                      playClick();
                      playSuccess();
                    }}
                    className="flex items-center gap-2 rounded-2xl border-b-4 border-[#D96E0D] bg-[#FF941F] px-6 py-3.5 text-sm font-black text-white shadow-xl transition hover:-translate-y-1"
                  >
                    <GraduationCap size={20} />
                    {text.students}
                  </Link>

                  <Link
                    href="/parent"
                    onClick={playClick}
                    className="flex items-center gap-2 rounded-2xl border border-white/25 bg-white/12 px-6 py-3.5 text-sm font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
                  >
                    <Users size={20} />
                    {text.parents}
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Link
                  href="/learn/arabic-a"
                  onClick={playClick}
                  className="group rounded-[28px] border border-white/20 bg-white/14 p-6 text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/20"
                >
                  <p className="text-3xl font-black">Arabic A</p>
                  <p className="mt-2 text-sm text-white/75">
                    {isArabic
                      ? "للطلاب الناطقين باللغة العربية"
                      : "For native Arabic speakers"}
                  </p>
                </Link>

                <Link
                  href="/learn/arabic-b"
                  onClick={playClick}
                  className="group rounded-[28px] border-b-8 border-[#D96E0D] bg-[#FF941F] p-6 text-white shadow-xl transition hover:-translate-y-1"
                >
                  <p className="text-3xl font-black">Arabic B</p>
                  <p className="mt-2 text-sm text-white/85">
                    {isArabic
                      ? "للطلاب غير الناطقين باللغة العربية"
                      : "For non-native Arabic speakers"}
                  </p>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-5 px-4 pb-10 lg:grid-cols-2">
        <Reveal>
          <Link
            href="/student"
            onClick={playClick}
            className="group relative block min-h-72 overflow-hidden rounded-[34px] bg-[#0B6B49] p-8 text-white shadow-[0_22px_60px_rgba(11,107,73,0.20)] transition hover:-translate-y-2"
          >
            <GraduationCap size={34} />
            <h2 className="mt-5 text-3xl font-black">{text.students}</h2>
            <p className="mt-4 max-w-xl leading-8 text-white/78">
              {isArabic
                ? "مسارات تعلم متميزة للناطقين بالعربية ولغير الناطقين بها، مع أنشطة وتحديات ومصادر متدرجة."
                : "Distinct learning pathways for native and non-native speakers, with activities, challenges and progressive resources."}
            </p>
            <Arrow className="absolute bottom-8 end-8 transition group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal delay={0.08}>
          <Link
            href="/parent"
            onClick={playClick}
            className="group relative block min-h-72 overflow-hidden rounded-[34px] bg-white p-8 shadow-[0_22px_60px_rgba(22,80,55,0.11)] transition hover:-translate-y-2"
          >
            <Users size={34} className="text-[#0B6B49]" />
            <h2 className="mt-5 text-3xl font-black">{text.parents}</h2>
            <p className="mt-4 max-w-xl leading-8 text-[#65736C]">
              {isArabic
                ? "اطلعوا على تعلم أبنائكم، والنشرة الأسبوعية، والفعاليات القادمة، وطرق دعم العربية في المنزل."
                : "Follow your child's learning, weekly updates, upcoming events and ways to support Arabic at home."}
            </p>
            <Arrow className="absolute bottom-8 end-8 text-[#0B6B49] transition group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-10">
        <Reveal>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-black text-[#FF7A00]">
                Latest Department Update
              </p>
              <h2 className="text-3xl font-black text-[#0B6B49]">
                {text.newsletter}
              </h2>
            </div>
          </div>

          <Link
            href="/newsletters"
            onClick={playClick}
            className="group grid overflow-hidden rounded-[34px] bg-white shadow-[0_20px_58px_rgba(22,80,55,0.11)] transition hover:-translate-y-1 lg:grid-cols-[360px_1fr]"
          >
            <div className="relative min-h-72 overflow-hidden">
              <Image
                src="/media/newsletter.svg"
                alt=""
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </div>

            <div className="p-8">
              <Newspaper size={30} className="text-[#0B6B49]" />
              <h3 className="mt-5 text-3xl font-black">
                {isArabic
                  ? weeklyNewsletter.titleAr
                  : weeklyNewsletter.titleEn}
              </h3>
              <p className="mt-5 leading-8 text-[#65736C]">
                {isArabic
                  ? weeklyNewsletter.summaryAr
                  : weeklyNewsletter.summaryEn}
              </p>
            </div>
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-10">
        <Reveal>
          <h2 className="mb-5 text-3xl font-black text-[#0B6B49]">
            {text.achievements}
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {achievements.map((item, index) => (
              <Link
                key={item.id}
                href="/achievements"
                onClick={playClick}
                className="group overflow-hidden rounded-[30px] bg-white shadow-[0_18px_48px_rgba(22,80,55,0.09)] transition hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={
                      index === 1
                        ? "/media/achievement.svg"
                        : "/media/gallery.svg"
                    }
                    alt=""
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="p-6">
                  {index === 1 ? (
                    <Sparkles className="text-[#FF7A00]" />
                  ) : (
                    <Trophy className="text-[#0B6B49]" />
                  )}

                  <h3 className="mt-4 text-xl font-black">
                    {isArabic ? item.titleAr : item.titleEn}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#65736C]">
                    {isArabic ? item.descriptionAr : item.descriptionEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-10">
        <Reveal>
          <h2 className="mb-5 text-3xl font-black text-[#0B6B49]">
            {text.activities}
          </h2>

          <div className="grid gap-5 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href="/events"
                onClick={playClick}
                className="group overflow-hidden rounded-[30px] bg-white shadow-[0_18px_48px_rgba(22,80,55,0.09)] transition hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/media/activities.svg"
                    alt=""
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="p-6">
                  <CalendarDays className="text-[#0B6B49]" />

                  <h3 className="mt-4 text-xl font-black">
                    {isArabic ? event.titleAr : event.titleEn}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#65736C]">
                    {isArabic ? event.descriptionAr : event.descriptionEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-14">
        <Reveal>
          <div className="relative min-h-[420px] overflow-hidden rounded-[38px]">
            <Image
              src="/media/gallery.svg"
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#063E2E]/66" />

            <div className="relative z-10 flex min-h-[420px] flex-col items-center justify-center px-6 text-center text-white">
              <Camera size={46} />
              <h2 className="mt-5 text-4xl font-black">{text.moments}</h2>
              <p className="mt-4 max-w-2xl leading-8 text-white/80">
                {isArabic
                  ? "صور الأنشطة والفعاليات وأعمال الطلاب واللحظات التي تحتفي باللغة والثقافة والإبداع."
                  : "Activities, events, student work and moments celebrating language, culture and creativity."}
              </p>

              <Link
                href="/events"
                onClick={playClick}
                className="mt-7 flex items-center gap-2 rounded-2xl bg-[#FF941F] px-6 py-3 font-black"
              >
                <PlayCircle size={19} />
                {text.viewAll}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[#0B6B49]/10 bg-white/65 py-7">
        <div className="mx-auto flex max-w-[1500px] justify-between px-4 text-xs font-bold text-[#65736C]">
          <span>King&apos;s College Doha</span>
          <span>Powered by BAYAN</span>
        </div>
      </footer>
    </main>
  );
}
