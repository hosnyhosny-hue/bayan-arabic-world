import Link from "next/link";
import {
  BookOpenText,
  Headphones,
  Home,
  MessageCircle,
  Shapes,
} from "lucide-react";

export default function ArabicBPage() {
  const units = [
    ["الاستماع والفهم", "Listening & Understanding", Headphones],
    ["التحدث والتواصل", "Speaking & Communication", MessageCircle],
    ["المفردات اليومية", "Everyday Vocabulary", Shapes],
    ["القراءة الوظيفية", "Functional Reading", BookOpenText],
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9EF] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/student" className="flex items-center gap-2 text-sm font-black text-[#0B6B49]">
          <Home size={17} />
          بوابة الطلاب
        </Link>

        <section className="mt-5 rounded-[36px] bg-[#FF941F] p-9 text-white">
          <p className="font-bold text-white/75">Arabic B</p>
          <h1 className="mt-2 text-4xl font-black">
            العربية لغير الناطقين بها
          </h1>
          <p className="mt-5 max-w-3xl leading-8 text-white/90">
            مسار تفاعلي يناسب غالبية طلاب المدرسة، ويركز على الاستماع،
            والمحادثة، والمفردات، والقراءة الوظيفية، وبناء الثقة في استخدام
            العربية.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {units.map(([ar, en, Icon]) => {
            const UnitIcon = Icon as typeof Headphones;
            return (
              <article key={ar as string} className="rounded-[28px] bg-white p-6 shadow-sm">
                <UnitIcon size={28} className="text-[#FF7A00]" />
                <h2 className="mt-4 text-xl font-black">{ar as string}</h2>
                <p className="mt-1 text-sm font-bold text-[#FF7A00]">{en as string}</p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
