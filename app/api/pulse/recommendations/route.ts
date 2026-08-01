import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const hour = new Date().getHours();
  const morning = hour >= 5 && hour < 12;
  const schoolDay = hour >= 7 && hour < 16;

  const items = schoolDay
    ? [
        { id: "live", title: "تابع ما يحدث الآن", description: "أحدث القصص والتحديثات المباشرة من اليوم المدرسي.", href: "#stories", label: "مباشر" },
        { id: "events", title: "فعاليات اليوم", description: "المواعيد والأماكن وما يبدأ خلال الساعات القادمة.", href: "#events", label: "حسب الوقت" },
        { id: "pulse", title: "النبض المستمر", description: "منشورات جديدة يتم تحميلها أثناء تصفحك.", href: "#feed", label: "متجدد" },
      ]
    : [
        { id: "edition", title: "ملخص إصدار اليوم", description: "أهم الأخبار واللحظات التي صنعت يوم المدرسة.", href: "#today", label: "مختارات AI" },
        { id: "achievement", title: "إنجازات تستحق المشاهدة", description: "أعمال طلابية وقصص نجاح جديدة.", href: "#achievements", label: "موصى به" },
        { id: "tomorrow", title: "استعد للغد", description: "راجع الفعاليات القادمة وما ينتظر مجتمع بيان.", href: "#events", label: "التالي" },
      ];

  return NextResponse.json({
    ok: true,
    items,
    reason: morning ? "اختيارات صباحية تركز على ما يبدأ الآن وما ينتظرك اليوم." : "اختيارات ذكية تلخص اليوم وتساعدك على الاستعداد للخطوة التالية.",
  });
}
