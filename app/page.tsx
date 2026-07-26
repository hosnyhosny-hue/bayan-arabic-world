"use client";

import Link from "next/link";
import {
  ArrowLeft,
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
import FeatureCard from "../src/components/public/FeatureCard";
import { siteContent } from "../src/data/site-content";

export default function Home() {
  const { school, weeklyNewsletter, achievements, events, pathways } =
    siteContent;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top_right,#EAF8F0_0%,#FFF9EF_42%,#F7EEDC_100%)] text-[#22312A]"
    >
      <PublicHeader />

      <section className="mx-auto max-w-[1500px] px-4 pb-8 pt-5">
        <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-l from-[#07533B] via-[#0B6B49] to-[#20AD74] px-6 py-10 text-white shadow-[0_30px_80px_rgba(11,107,73,0.24)] sm:px-10 lg:px-14 lg:py-14">
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 right-[38%] h-64 w-64 rounded-full bg-[#FF941F]/25" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black">
                {school.nameAr}
              </span>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                نُلهم اللغة، ونبني الهوية، ونحتفي بالإبداع
              </h1>

              <p
                dir="ltr"
                className="mt-4 max-w-3xl text-left text-lg font-bold text-white/75"
              >
                Inspiring Language, Building Identity, Celebrating Creativity
              </p>

              <p className="mt-6 max-w-3xl text-sm leading-8 text-white/80 sm:text-base">
                بوابة رقمية تجمع تعلم الطلاب، وإرشادات أولياء الأمور، وإنجازات
                القسم، والأنشطة الثقافية، والنشرة الأسبوعية، وأعمال الطلاب في
                تجربة واحدة حديثة.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/student"
                  className="flex items-center gap-2 rounded-2xl border-b-4 border-[#D96E0D] bg-[#FF941F] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-1"
                >
                  <GraduationCap size={20} />
                  بوابة الطلاب
                </Link>

                <Link
                  href="/parent"
                  className="flex items-center gap-2 rounded-2xl border border-white/25 bg-white/12 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                  <Users size={20} />
                  بوابة أولياء الأمور
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[28px] bg-white/12 p-5 backdrop-blur">
                <p className="text-3xl font-black">Arabic A</p>
                <p className="mt-2 text-xs leading-6 text-white/70">
                  للطلاب الناطقين باللغة العربية
                </p>
              </div>

              <div className="rounded-[28px] bg-[#FF941F] p-5 shadow-xl">
                <p className="text-3xl font-black">Arabic B</p>
                <p className="mt-2 text-xs leading-6 text-white/85">
                  للطلاب غير الناطقين باللغة العربية
                </p>
              </div>

              <div className="col-span-2 rounded-[28px] bg-white/12 p-5 backdrop-blur">
                <p className="text-xs font-bold text-white/65">
                  مسارات تعليم مناسبة لجميع الطلاب
                </p>
                <p className="mt-2 text-xl font-black">
                  تعلم، تواصل، ثقافة، إبداع
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-5 px-4 pb-8 lg:grid-cols-2">
        <FeatureCard
          featured
          href="/student"
          titleAr="بوابة الطلاب"
          titleEn="Student Learning Hub"
          description="مسارات تعلم تفاعلية للطلاب الناطقين باللغة العربية وغير الناطقين بها، مع تحديات وأنشطة ومصادر متدرجة."
          icon={<GraduationCap size={25} />}
        />

        <FeatureCard
          href="/parent"
          titleAr="بوابة أولياء الأمور"
          titleEn="Parent Hub"
          description="تعرفوا إلى ما يتعلمه أبناؤكم، والنشرة الأسبوعية، والفعاليات القادمة، وطرق دعم تعلم اللغة العربية في المنزل."
          icon={<Users size={25} />}
        />
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-black text-[#FF7A00]">
              Latest Department Update
            </p>
            <h2 className="text-3xl font-black text-[#0B6B49]">
              النشرة الأسبوعية
            </h2>
          </div>

          <Link
            href="/newsletters"
            className="flex items-center gap-2 text-xs font-black text-[#0B6B49]"
          >
            جميع النشرات
            <ArrowLeft size={16} />
          </Link>
        </div>

        <Link
          href="/newsletters"
          className="grid overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(22,80,55,0.10)] transition hover:-translate-y-1 lg:grid-cols-[260px_1fr]"
        >
          <div className="flex min-h-56 items-center justify-center bg-gradient-to-br from-[#0B6B49] to-[#20AD74] text-white">
            <div className="text-center">
              <Newspaper size={52} className="mx-auto" />
              <p className="mt-4 text-2xl font-black">
                {weeklyNewsletter.weekAr}
              </p>
              <p className="text-xs text-white/70">
                {weeklyNewsletter.academicYear}
              </p>
            </div>
          </div>

          <div className="p-7">
            <span className="rounded-full bg-[#FFF0DF] px-3 py-1 text-xs font-black text-[#FF7A00]">
              جديد
            </span>

            <h3 className="mt-4 text-2xl font-black text-[#22312A]">
              {weeklyNewsletter.titleAr}
            </h3>

            <p
              dir="ltr"
              className="mt-1 text-left text-sm font-bold text-[#0B6B49]"
            >
              {weeklyNewsletter.titleEn}
            </p>

            <p className="mt-5 max-w-4xl text-sm leading-8 text-[#65736C]">
              {weeklyNewsletter.summaryAr}
            </p>
          </div>
        </Link>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-black text-[#FF7A00]">
              Department Highlights
            </p>
            <h2 className="text-3xl font-black text-[#0B6B49]">
              إنجازات القسم
            </h2>
          </div>

          <Link
            href="/achievements"
            className="flex items-center gap-2 text-xs font-black text-[#0B6B49]"
          >
            عرض جميع الإنجازات
            <ArrowLeft size={16} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {achievements.map((achievement, index) => (
            <Link
              key={achievement.id}
              href="/achievements"
              className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_16px_45px_rgba(22,80,55,0.08)] transition hover:-translate-y-1"
            >
              <div
                className={[
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  index === 1
                    ? "bg-[#FFF0DF] text-[#FF7A00]"
                    : "bg-[#EEF8F2] text-[#0B6B49]",
                ].join(" ")}
              >
                {index === 1 ? <Sparkles /> : <Trophy />}
              </div>

              <p className="mt-5 text-xs font-black text-[#FF7A00]">
                {achievement.categoryAr} • {achievement.year}
              </p>

              <h3 className="mt-2 text-xl font-black">
                {achievement.titleAr}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#65736C]">
                {achievement.descriptionAr}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-black text-[#FF7A00]">
              Activities & Events
            </p>
            <h2 className="text-3xl font-black text-[#0B6B49]">
              أنشطة وفعاليات القسم
            </h2>
          </div>

          <Link
            href="/events"
            className="flex items-center gap-2 text-xs font-black text-[#0B6B49]"
          >
            عرض جميع الأنشطة
            <ArrowLeft size={16} />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href="/events"
              className="group overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_16px_45px_rgba(22,80,55,0.08)] transition hover:-translate-y-1"
            >
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#EAF8F0] to-[#FFF0DF]">
                <CalendarDays size={44} className="text-[#0B6B49]" />
              </div>

              <div className="p-5">
                <p className="text-xs font-black text-[#FF7A00]">
                  {event.dateAr} • {event.typeAr}
                </p>
                <h3 className="mt-2 text-xl font-black">{event.titleAr}</h3>
                <p className="mt-3 text-sm leading-7 text-[#65736C]">
                  {event.descriptionAr}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-4 px-4 pb-12 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["معرض الصور", "Photo Gallery", Camera, "/events"],
          ["مكتبة الفيديو", "Video Library", PlayCircle, "/events"],
          ["أعمال الطلاب", "Student Work", BookOpen, "/student"],
          ["رحلة التعلم", "Learning Journey", GraduationCap, "/student"],
        ].map(([ar, en, Icon, href]) => {
          const ItemIcon = Icon as typeof Camera;

          return (
            <Link
              key={ar as string}
              href={href as string}
              className="rounded-[26px] border border-white/80 bg-white/90 p-5 shadow-[0_14px_40px_rgba(22,80,55,0.08)] transition hover:-translate-y-1"
            >
              <ItemIcon size={26} className="text-[#0B6B49]" />
              <h3 className="mt-4 font-black">{ar as string}</h3>
              <p className="mt-1 text-xs font-bold text-[#0B6B49]">
                {en as string}
              </p>
            </Link>
          );
        })}
      </section>

      <footer className="border-t border-[#0B6B49]/10 bg-white/60 py-6">
        <div className="mx-auto flex max-w-[1500px] justify-between px-4 text-xs font-bold text-[#65736C]">
          <span>King&apos;s College Doha</span>
          <span>Powered by BAYAN</span>
        </div>
      </footer>
    </main>
  );
}
