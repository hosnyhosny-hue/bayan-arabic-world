import PortalCard from "@/components/home/PortalCard";
import { portalItems } from "@/data/portal-items";
import { LogIn, Moon, Search } from "lucide-react";

export default function Home() {
  return (
    <main
      dir="rtl"
      className="h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top_right,#EEF7F1_0%,#FFF9EF_48%,#F4EAD8_100%)] text-[#26332D]"
    >
      <div className="mx-auto flex h-full max-w-[1600px] flex-col px-3 py-3 sm:px-5 lg:px-8">
        <header className="flex h-14 shrink-0 items-center justify-between rounded-2xl bg-[#0B5D3B] px-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F28C28] text-sm font-black">
              ب
            </div>

            <div className="leading-tight">
              <p className="text-sm font-bold">
                البوابة الرقمية لقسم اللغة العربية
              </p>
              <p className="text-[10px] text-white/75">
                Arabic Department Digital Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-xl px-2 py-2 text-xs transition hover:bg-white/10"
            >
              العربية | English
            </button>

            <button
              type="button"
              aria-label="البحث"
              className="rounded-xl p-2 transition hover:bg-white/10"
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              aria-label="الوضع الليلي"
              className="hidden rounded-xl p-2 transition hover:bg-white/10 sm:block"
            >
              <Moon size={18} />
            </button>

            <button
              type="button"
              aria-label="تسجيل الدخول"
              className="rounded-xl p-2 transition hover:bg-white/10"
            >
              <LogIn size={18} />
            </button>
          </div>
        </header>

        <section className="flex shrink-0 items-center justify-between gap-4 px-2 py-3">
          <div>
            <h1 className="text-xl font-black text-[#0B5D3B] sm:text-2xl">
              قسم اللغة العربية
            </h1>
            <p className="text-xs font-medium text-[#F28C28] sm:text-sm">
              لغة وثقافة وإبداع
            </p>
          </div>

          <div className="hidden text-left md:block" dir="ltr">
            <h2 className="text-base font-bold text-[#0B5D3B]">
              Arabic at King&apos;s
            </h2>
            <p className="text-xs text-[#18865A]">
              Language, Culture and Creativity
            </p>
          </div>
        </section>

        <section className="min-h-0 flex-1">
          <div className="grid h-full grid-cols-4 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-8">
            {portalItems.map((item) => (
              <PortalCard key={item.href} {...item} />
            ))}
          </div>
        </section>

        <footer className="flex h-7 shrink-0 items-end justify-between px-2 text-[10px] text-[#0B5D3B]/70">
          <span>King&apos;s College Doha</span>
          <span>Powered by BAYAN</span>
        </footer>
      </div>
    </main>
  );
}
