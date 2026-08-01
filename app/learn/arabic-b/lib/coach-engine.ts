import type { LearnerJourneyState } from "./journey-types";
import type { WorldExperienceContent } from "./world-experience-types";

export type CoachInsight = {
  mood: "welcome" | "progress" | "review" | "celebrate";
  eyebrowAr: string;
  titleAr: string;
  messageAr: string;
  actionAr: string;
  reviewPhrase: string | null;
};

export function buildCoachInsight(
  content: WorldExperienceContent,
  state: LearnerJourneyState,
): CoachInsight {
  const completed = content.stages.filter((stage) =>
    state.completedStageIds.includes(stage.id),
  );

  const progress = Math.round(
    (completed.length / content.stages.length) * 100,
  );

  if (progress >= 100) {
    return {
      mood: "celebrate",
      eyebrowAr: "إنجاز رائع",
      titleAr: `أتقنت عالم ${content.titleAr}`,
      messageAr:
        "أكملت جميع مراحل هذا العالم. أعد المهمة النهائية لاحقًا لتثبيت الطلاقة، ثم انتقل إلى موقف جديد.",
      actionAr: "استعرض المكافأة",
      reviewPhrase: null,
    };
  }

  if (progress >= 65) {
    return {
      mood: "progress",
      eyebrowAr: "أنت قريب جدًا",
      titleAr: "حوّل العبارات إلى حديث طبيعي",
      messageAr:
        "أصبحت تعرف العبارات الأساسية. ركّز الآن على قولها دون قراءة وبنبرة طبيعية.",
      actionAr: "ابدأ تحدي التحدث",
      reviewPhrase: content.phrases[1]?.arabic ?? null,
    };
  }

  if (progress >= 25) {
    return {
      mood: "review",
      eyebrowAr: "توصية شخصية",
      titleAr: "راجع عبارة واحدة قبل المتابعة",
      messageAr:
        "مراجعة قصيرة الآن ستجعل المهمة التالية أسهل. اقرأ العبارة، اخفها، ثم قلها من الذاكرة.",
      actionAr: "مراجعة لمدة دقيقة",
      reviewPhrase: content.phrases[0]?.arabic ?? null,
    };
  }

  return {
    mood: "welcome",
    eyebrowAr: "مدربك بيان",
    titleAr: `لنبدأ مغامرة ${content.titleAr}`,
    messageAr:
      "استمع أولًا دون ترجمة، ثم اكتشف العبارات، وبعد ذلك استخدمها بنفسك داخل الموقف.",
    actionAr: "ابدأ بالاستماع",
    reviewPhrase: null,
  };
}
