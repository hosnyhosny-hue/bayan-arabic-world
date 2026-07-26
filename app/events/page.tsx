import Link from "next/link";
import { CalendarDays, Home } from "lucide-react";
import { siteContent } from "../../src/data/site-content";

export default function EventsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9EF] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="flex items-center gap-2 font-black text-[#0B6B49]">
          <Home size={17} />
          الرئيسية
        </Link>

        <h1 className="mt-6 text-4xl font-black text-[#0B6B49]">
          أنشطة وفعاليات القسم
        </h1>

        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {siteContent.events.map((event) => (
            <article key={event.id} className="overflow-hidden rounded-[30px] bg-white shadow-sm">
              <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#EAF8F0] to-[#FFF0DF]">
                <CalendarDays size={48} className="text-[#0B6B49]" />
              </div>
              <div className="p-6">
                <p className="text-xs font-black text-[#FF7A00]">
                  {event.dateAr} • {event.typeAr}
                </p>
                <h2 className="mt-2 text-xl font-black">{event.titleAr}</h2>
                <p className="mt-4 text-sm leading-7 text-[#65736C]">
                  {event.descriptionAr}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
