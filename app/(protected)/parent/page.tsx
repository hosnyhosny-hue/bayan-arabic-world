import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Download,
  Home,
  Newspaper,
  Users,
} from "lucide-react";
import { siteContent } from "@/src/data/site-content";

export default function ParentPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top_right,#EAF8F0,#FFF9EF_55%,#F7EEDC)] px-4 py-6 text-[#22312A]"
    >
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black text-[#0B6B49] shadow-sm"
        >
          <Home size={17} />
          الرئيسية
        </Link>

        <section className="mt-5 rounded-[36px] bg-[#0B6B49] p-8 text-white shadow-xl">
          <Users size={38} />
          <h1 className="mt-5 text-4xl font-black">بوابة أولياء الأمور</h1>
          <p className="mt-2 text-lg font-bold text-white/70">Parent Hub</p>
          <p className="mt-5 max-w-3xl leading-8 text-white/80">
            كل ما يحتاجه ولي الأمر لمتابعة رحلة تعلم الطالب، ودعم اللغة
            العربية في المنزل، والاطلاع على النشرات والفعاليات والإنجازات.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/newsletters"
            className="rounded-[28px] bg-white p-6 shadow-sm"
          >
            <Newspaper size={28} className="text-[#0B6B49]" />
            <h2 className="mt-4 text-xl font-black">النشرة الأسبوعية</h2>
            <p className="mt-3 text-sm leading-7 text-[#65736C]">
              {siteContent.weeklyNewsletter.summaryAr}
            </p>
          </Link>

          <article className="rounded-[28px] bg-white p-6 shadow-sm">
            <BookOpen size={28} className="text-[#0B6B49]" />
            <h2 className="mt-4 text-xl font-black">
              دعم العربية في المنزل
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#65736C]">
              أفكار للقراءة المشتركة، وتنمية المفردات، وممارسة المحادثة
              والاستماع خارج الصف.
            </p>
          </article>

          <Link
            href="/events"
            className="rounded-[28px] bg-white p-6 shadow-sm"
          >
            <CalendarDays size={28} className="text-[#FF7A00]" />
            <h2 className="mt-4 text-xl font-black">الفعاليات القادمة</h2>
            <p className="mt-3 text-sm leading-7 text-[#65736C]">
              اطلعوا على برامج القسم الثقافية والمسابقات والمعارض والأنشطة
              القادمة.
            </p>
          </Link>

          <article className="rounded-[28px] bg-white p-6 shadow-sm">
            <Download size={28} className="text-[#0B6B49]" />
            <h2 className="mt-4 text-xl font-black">ملفات وأدلة</h2>
            <p className="mt-3 text-sm leading-7 text-[#65736C]">
              أدلة أولياء الأمور، وأوراق المراجعة، والمصادر التعليمية والملفات
              القابلة للتحميل.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-[30px] bg-[#FF941F] p-7 text-white">
          <h2 className="text-2xl font-black">
            هل يدرس طفلك Arabic A أم Arabic B؟
          </h2>

          <p className="mt-3 max-w-3xl leading-8 text-white/85">
            Arabic A للطلاب الناطقين باللغة العربية، بينما Arabic B مصمم
            للطلاب غير الناطقين بها ويركز على التواصل والمفردات والمهارات
            الوظيفية.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/learn/arabic-a"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#0B6B49]"
            >
              Arabic A
              <ArrowLeft size={16} />
            </Link>

            <Link
              href="/learn/arabic-b"
              className="flex items-center gap-2 rounded-xl bg-[#0B6B49] px-4 py-3 text-sm font-black text-white"
            >
              Arabic B
              <ArrowLeft size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
