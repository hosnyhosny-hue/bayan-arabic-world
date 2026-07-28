"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./arabic-b.module.css";
import Hero from "./components/Hero/Hero";
import Header from "./components/Header/Header";
import JourneyMap from "./components/JourneyMap/JourneyMap";
import JourneyEngineProvider from "./engine/core/JourneyEngineProvider";
import JourneyEngineDevPanel from "./engine/core/JourneyEngineDevPanel";

type SpeechRecognitionAlternativeLike = {
  transcript?: string;
};

type SpeechRecognitionResultLike = {
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  [index: number]: SpeechRecognitionResultLike;
};

interface SpeechRecognitionResultEventLike extends Event {
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

type Language = "ar" | "en";
type LevelId = "A0" | "A1" | "A2" | "B1" | "B2";

type Level = {
  id: LevelId;
  number: string;
  titleAr: string;
  titleEn: string;
  promiseAr: string;
  promiseEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  units: number;
  lessons: number;
  locked?: boolean;
};

type PlacementQuestion = {
  promptAr: string;
  promptEn: string;
  helperAr?: string;
  helperEn?: string;
  options: {
    ar: string;
    en: string;
    score: number;
  }[];
};

const levels: Level[] = [
  {
    id: "A0",
    number: "01",
    titleAr: "البداية",
    titleEn: "First Steps",
    promiseAr: "أتعرف إلى العربية وأستخدم عباراتي الأولى.",
    promiseEn: "I recognise Arabic and use my first expressions.",
    descriptionAr: "التحية، التعارف، الحروف والأصوات، الكلمات اليومية.",
    descriptionEn: "Greetings, introductions, letters, sounds and daily words.",
    icon: "🌱",
    units: 6,
    lessons: 24,
  },
  {
    id: "A1",
    number: "02",
    titleAr: "التواصل",
    titleEn: "Everyday Communication",
    promiseAr: "أتحدث عن نفسي وأسرتي ومدرستي.",
    promiseEn: "I talk about myself, my family and my school.",
    descriptionAr: "الأسرة، المدرسة، الوقت، الأرقام، الطعام والروتين.",
    descriptionEn: "Family, school, time, numbers, food and daily routines.",
    icon: "🏡",
    units: 8,
    lessons: 32,
  },
  {
    id: "A2",
    number: "03",
    titleAr: "الحياة اليومية",
    titleEn: "Real-Life Arabic",
    promiseAr: "أتعامل مع مواقف الحياة اليومية بثقة.",
    promiseEn: "I handle everyday situations with growing confidence.",
    descriptionAr: "التسوق، الاتجاهات، الصحة، الهوايات، السفر والأماكن.",
    descriptionEn: "Shopping, directions, health, hobbies, travel and places.",
    icon: "🌍",
    units: 8,
    lessons: 36,
  },
  {
    id: "B1",
    number: "04",
    titleAr: "التعبير",
    titleEn: "Expression",
    promiseAr: "أشرح رأيي وأروي تجربة وأفهم نصوصًا أطول.",
    promiseEn: "I express opinions, narrate experiences and read longer texts.",
    descriptionAr: "الرأي، السرد، المقارنة، الرسائل والمشروعات القصيرة.",
    descriptionEn:
      "Opinions, narration, comparison, messages and mini-projects.",
    icon: "⭐",
    units: 10,
    lessons: 40,
  },
  {
    id: "B2",
    number: "05",
    titleAr: "الطلاقة",
    titleEn: "Confident Fluency",
    promiseAr: "أناقش أفكارًا وأستخدم العربية في التعلم.",
    promiseEn: "I discuss ideas and use Arabic for academic learning.",
    descriptionAr: "النقاش، العروض، القراءة المتقدمة والكتابة المنظمة.",
    descriptionEn: "Discussion, presentations, extended reading and writing.",
    icon: "🏆",
    units: 10,
    lessons: 44,
  },
];

const placementQuestions: PlacementQuestion[] = [
  {
    promptAr: "عندما ترى كلمة «مرحبا»، ماذا تفهم؟",
    promptEn: "When you see the word “مرحبا”, what does it mean?",
    options: [
      { ar: "مرحبًا / Hello", en: "Hello", score: 1 },
      { ar: "شكرًا / Thank you", en: "Thank you", score: 0 },
      { ar: "لا أعرف", en: "I do not know", score: 0 },
    ],
  },
  {
    promptAr: "اختر الرد المناسب: ما اسمك؟",
    promptEn: "Choose the best response: ما اسمك؟",
    helperAr: "What is your name?",
    helperEn: "What is your name?",
    options: [
      { ar: "اسمي آدم.", en: "My name is Adam.", score: 2 },
      { ar: "أنا بخير.", en: "I am fine.", score: 0 },
      { ar: "إلى اللقاء.", en: "Goodbye.", score: 0 },
    ],
  },
  {
    promptAr: "أي جملة تعني: I go to school every day؟",
    promptEn: "Which sentence means: I go to school every day?",
    options: [
      {
        ar: "أذهب إلى المدرسة كل يوم.",
        en: "أذهب إلى المدرسة كل يوم.",
        score: 3,
      },
      {
        ar: "ذهبت إلى المدرسة أمس.",
        en: "ذهبت إلى المدرسة أمس.",
        score: 1,
      },
      {
        ar: "مدرستي كبيرة.",
        en: "مدرستي كبيرة.",
        score: 0,
      },
    ],
  },
  {
    promptAr: "اختر الكلمة المناسبة: أنا أحب ___ الكتب.",
    promptEn: "Choose the missing word: أنا أحب ___ الكتب.",
    options: [
      { ar: "قراءة", en: "قراءة", score: 3 },
      { ar: "يقرأ", en: "يقرأ", score: 0 },
      { ar: "مقروء", en: "مقروء", score: 1 },
    ],
  },
  {
    promptAr: "أي جملة تعبّر عن رأي؟",
    promptEn: "Which sentence expresses an opinion?",
    options: [
      {
        ar: "في رأيي، التعلم بالقصص أكثر متعة.",
        en: "In my opinion, learning through stories is more enjoyable.",
        score: 4,
      },
      {
        ar: "الكتاب على الطاولة.",
        en: "The book is on the table.",
        score: 1,
      },
      {
        ar: "افتح الباب.",
        en: "Open the door.",
        score: 0,
      },
    ],
  },
  {
    promptAr: "اقرأ: رغم أن الرحلة كانت طويلة، استمتعنا بها. ما المعنى الأقرب؟",
    promptEn:
      "Read: رغم أن الرحلة كانت طويلة، استمتعنا بها. What is the closest meaning?",
    options: [
      {
        ar: "استمتعنا بالرحلة مع أنها كانت طويلة.",
        en: "We enjoyed the journey although it was long.",
        score: 5,
      },
      {
        ar: "لم نذهب في الرحلة.",
        en: "We did not go on the journey.",
        score: 0,
      },
      {
        ar: "كانت الرحلة قصيرة.",
        en: "The journey was short.",
        score: 0,
      },
    ],
  },
  {
    promptAr: "هل تستطيع كتابة فقرة قصيرة عن يومك بالعربية؟",
    promptEn: "Can you write a short paragraph about your day in Arabic?",
    options: [
      {
        ar: "ليس بعد.",
        en: "Not yet.",
        score: 0,
      },
      {
        ar: "أكتب جملًا بسيطة.",
        en: "I can write simple sentences.",
        score: 2,
      },
      {
        ar: "أكتب فقرة مترابطة.",
        en: "I can write a connected paragraph.",
        score: 4,
      },
      {
        ar: "أكتب بتفصيل وأستخدم روابط متنوعة.",
        en: "I write in detail using varied connectors.",
        score: 5,
      },
    ],
  },
  {
    promptAr: "كيف تصف قدرتك على التحدث بالعربية؟",
    promptEn: "How would you describe your Arabic speaking ability?",
    options: [
      {
        ar: "أعرف كلمات قليلة.",
        en: "I know a few words.",
        score: 0,
      },
      {
        ar: "أستخدم عبارات قصيرة.",
        en: "I use short expressions.",
        score: 2,
      },
      {
        ar: "أتحدث في مواقف يومية.",
        en: "I communicate in everyday situations.",
        score: 3,
      },
      {
        ar: "أشرح رأيي وأناقش أفكارًا.",
        en: "I explain opinions and discuss ideas.",
        score: 5,
      },
    ],
  },
];

const dailyMission = {
  titleAr: "في مقصف المدرسة",
  titleEn: "At the School Canteen",
  instructionAr: "استمع إلى العبارة، ثم اختر الرد الأنسب.",
  instructionEn: "Listen to the expression, then choose the best reply.",
  phraseAr: "ماذا تريد أن تأكل؟",
  phraseEn: "What would you like to eat?",
};

const skills = [
  {
    icon: "🎧",
    ar: "الاستماع",
    en: "Listening",
    detailAr: "حوار قصير من الحياة اليومية.",
    detailEn: "Short real-life conversations.",
  },
  {
    icon: "🗣️",
    ar: "التحدث",
    en: "Speaking",
    detailAr: "تدريب على النطق والاستجابة.",
    detailEn: "Pronunciation and response practice.",
  },
  {
    icon: "📖",
    ar: "القراءة",
    en: "Reading",
    detailAr: "نصوص مصورة ومتدرجة.",
    detailEn: "Visual, levelled reading.",
  },
  {
    icon: "✍️",
    ar: "الكتابة",
    en: "Writing",
    detailAr: "من الكلمة إلى الفقرة.",
    detailEn: "From words to connected writing.",
  },
];

function suggestedLevel(score: number): LevelId {
  if (score <= 4) return "A0";
  if (score <= 10) return "A1";
  if (score <= 17) return "A2";
  if (score <= 25) return "B1";
  return "B2";
}

type MeaningOption = {
  id: string;
  en: string;
  correct: boolean;
};

type LevelExperience = {
  phraseAr: string;
  phraseEn: string;
  speechTextAr: string;
  meaningOptions: MeaningOption[];
};

const levelExperienceContent: Record<LevelId, LevelExperience> = {
  A0: {
    phraseAr: "مَا اسْمُكَ؟",
    phraseEn: "What is your name?",
    speechTextAr: "مَا اسْمُكَ؟",
    meaningOptions: [
      {
        id: "a0-correct",
        en: "What is your name?",
        correct: true,
      },
      {
        id: "a0-wrong-1",
        en: "Where do you live?",
        correct: false,
      },
      {
        id: "a0-wrong-2",
        en: "How old are you?",
        correct: false,
      },
    ],
  },

  A1: {
    phraseAr: "مَاذَا تُرِيدُ أَنْ تَأْكُلَ؟",
    phraseEn: "What would you like to eat?",
    speechTextAr: "مَاذَا تُرِيدُ أَنْ تَأْكُلَ؟",
    meaningOptions: [
      {
        id: "a1-correct",
        en: "What would you like to eat?",
        correct: true,
      },
      {
        id: "a1-wrong-1",
        en: "Where did you buy the food?",
        correct: false,
      },
      {
        id: "a1-wrong-2",
        en: "When will you go home?",
        correct: false,
      },
    ],
  },

  A2: {
    phraseAr: "أُرِيدُ أَنْ أَحْجِزَ غُرْفَةً لِلَيْلَتَيْنِ الْقَادِمَتَيْنِ.",
    phraseEn: "I would like to book a room for the next two nights.",
    speechTextAr:
      "أُرِيدُ أَنْ أَحْجِزَ غُرْفَةً لِلَيْلَتَيْنِ الْقَادِمَتَيْنِ.",
    meaningOptions: [
      {
        id: "a2-correct",
        en: "I would like to book a room for the next two nights.",
        correct: true,
      },
      {
        id: "a2-wrong-1",
        en: "I would like to order food for two people.",
        correct: false,
      },
      {
        id: "a2-wrong-2",
        en: "I stayed in this hotel two years ago.",
        correct: false,
      },
    ],
  },

  B1: {
    phraseAr:
      "فِي رَأْيِي، هَذِهِ فِكْرَةٌ مُفِيدَةٌ؛ لِأَنَّهَا تُسَاعِدُ عَلَى تَحْسِينِ التَّعَلُّمِ.",
    phraseEn:
      "In my opinion, this is a useful idea because it helps improve learning.",
    speechTextAr:
      "فِي رَأْيِي، هَذِهِ فِكْرَةٌ مُفِيدَةٌ؛ لِأَنَّهَا تُسَاعِدُ عَلَى تَحْسِينِ التَّعَلُّمِ.",
    meaningOptions: [
      {
        id: "b1-correct",
        en: "In my opinion, this is a useful idea because it helps improve learning.",
        correct: true,
      },
      {
        id: "b1-wrong-1",
        en: "I disagree with this idea because it makes learning difficult.",
        correct: false,
      },
      {
        id: "b1-wrong-2",
        en: "This project should be stopped before the next lesson.",
        correct: false,
      },
    ],
  },

  B2: {
    phraseAr:
      "يُمْكِنُنَا تَطْوِيرُ الْمَشْرُوعِ بِهَذِهِ الطَّرِيقَةِ، شَرِيطَةَ أَنْ نُرَاعِيَ احْتِيَاجَاتِ الْمُتَعَلِّمِينَ.",
    phraseEn:
      "We can develop the project in this way, provided that we consider the learners' needs.",
    speechTextAr:
      "يُمْكِنُنَا تَطْوِيرُ الْمَشْرُوعِ بِهَذِهِ الطَّرِيقَةِ، شَرِيطَةَ أَنْ نُرَاعِيَ احْتِيَاجَاتِ الْمُتَعَلِّمِينَ.",
    meaningOptions: [
      {
        id: "b2-correct",
        en: "We can develop the project in this way, provided that we consider the learners' needs.",
        correct: true,
      },
      {
        id: "b2-wrong-1",
        en: "We should develop the project without considering the learners.",
        correct: false,
      },
      {
        id: "b2-wrong-2",
        en: "The project cannot be developed under any circumstances.",
        correct: false,
      },
    ],
  },
};

export default function ArabicBPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [placementOpen, setPlacementOpen] = useState(false);
  const [placementFinished, setPlacementFinished] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState<LevelId | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelId>("A0");
  const [missionComplete, setMissionComplete] = useState(false);
  const [missionChoice, setMissionChoice] = useState<string | null>(null);
  const [previewStep, setPreviewStep] = useState(1);
  const [levelExperienceOpen, setLevelExperienceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [speakingComplete, setSpeakingComplete] = useState(false);
  const [meaningChoice, setMeaningChoice] = useState<string | null>(null);
  const [meaningCorrect, setMeaningCorrect] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isArabic = language === "ar";

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("bayan-arabic-b-language");
      const savedLevel = localStorage.getItem(
        "bayan-arabic-b-placement-level",
      ) as LevelId | null;
      const savedMission = localStorage.getItem("bayan-arabic-b-daily-mission");

      if (savedLanguage === "ar" || savedLanguage === "en") {
        setLanguage(savedLanguage);
      }

      if (savedLevel && levels.some((item) => item.id === savedLevel)) {
        setLevel(savedLevel);
        setSelectedLevel(savedLevel);
        setPlacementFinished(true);
      }

      if (savedMission === "complete") {
        setMissionComplete(true);
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("bayan-arabic-b-language", language);
  }, [language, loaded]);

  const currentPlacementQuestion = placementQuestions[questionIndex];

  const selectedLevelData = useMemo(
    () => levels.find((item) => item.id === selectedLevel) ?? levels[0],
    [selectedLevel],
  );

  const currentExperience = levelExperienceContent[selectedLevelData.id];

  const direction = isArabic ? "rtl" : "ltr";

  function openPlacement() {
    setPlacementOpen(true);

    if (!placementFinished) {
      setQuestionIndex(0);
      setScore(0);
      setLevel(null);
    }
  }

  function answerPlacement(answerScore: number) {
    const nextScore = score + answerScore;

    if (questionIndex < placementQuestions.length - 1) {
      setScore(nextScore);
      setQuestionIndex((current) => current + 1);
      return;
    }

    const result = suggestedLevel(nextScore);
    setScore(nextScore);
    setLevel(result);
    setSelectedLevel(result);
    setPlacementFinished(true);
    localStorage.setItem("bayan-arabic-b-placement-level", result);
  }

  function restartPlacement() {
    setQuestionIndex(0);
    setScore(0);
    setLevel(null);
    setPlacementFinished(false);
    localStorage.removeItem("bayan-arabic-b-placement-level");
  }

  function chooseMission(answer: string, correct: boolean) {
    setMissionChoice(answer);

    if (correct) {
      setMissionComplete(true);
      localStorage.setItem("bayan-arabic-b-daily-mission", "complete");
    }
  }

  return (
    <main className={styles.page} lang={isArabic ? "ar" : "en"} dir={direction}>
      <Header
        isArabic={isArabic}
        onToggleLanguage={() =>
          setLanguage((current) => (current === "ar" ? "en" : "ar"))
        }
      />

      <Hero isArabic={isArabic} openPlacement={openPlacement} />

      <section className={styles.startPanel}>
        <div className={styles.startMessage}>
          <span className={styles.startIcon}>{level ? "✨" : "👋"}</span>

          <div>
            <small>
              {level
                ? isArabic
                  ? "مسارك المقترح"
                  : "Your suggested pathway"
                : isArabic
                  ? "هل هذه زيارتك الأولى؟"
                  : "Is this your first visit?"}
            </small>

            <h2>
              {level
                ? isArabic
                  ? `ابدأ من المستوى ${level}`
                  : `Start from Level ${level}`
                : isArabic
                  ? "سنساعدك على معرفة أفضل نقطة للبداية."
                  : "We will help you find the best place to begin."}
            </h2>
          </div>
        </div>

        <button
          type="button"
          className={styles.startPanelButton}
          onClick={openPlacement}
        >
          {level
            ? isArabic
              ? "عرض النتيجة"
              : "View My Result"
            : isArabic
              ? "اكتشف مستواي"
              : "Find My Level"}
        </button>
      </section>

      <JourneyEngineProvider>
        <JourneyMap isArabic={isArabic} />
        <JourneyEngineDevPanel />
      </JourneyEngineProvider>

      <section className={styles.missionSection} id="mission">
        <div className={styles.missionIntro}>
          <span className={styles.sectionKicker}>
            {isArabic
              ? "تعلّم شيئًا يمكنك استخدامه اليوم"
              : "Learn something you can use today"}
          </span>

          <h2>{isArabic ? "تحدي اليوم" : "Today’s Mission"}</h2>

          <p>
            {isArabic
              ? "مهمة قصيرة من موقف مدرسي حقيقي. لا تحتاج إلى تسجيل دخول."
              : "A short mission from a real school situation. No sign-in required."}
          </p>

          <div className={styles.missionReward}>
            <span>✦</span>
            <div>
              <small>{isArabic ? "بعد الإكمال" : "After completion"}</small>
              <strong>
                {isArabic
                  ? "أستطيع طلب الطعام بالعربية."
                  : "I can order food in Arabic."}
              </strong>
            </div>
          </div>
        </div>

        <div className={styles.missionCard}>
          <div className={styles.missionCardTop}>
            <div>
              <small>{isArabic ? "الموقف" : "Situation"}</small>
              <strong>
                {isArabic ? dailyMission.titleAr : dailyMission.titleEn}
              </strong>
            </div>

            <span className={styles.missionDuration}>
              2 {isArabic ? "دقيقة" : "min"}
            </span>
          </div>

          <p className={styles.missionInstruction}>
            {isArabic ? dailyMission.instructionAr : dailyMission.instructionEn}
          </p>

          <button
            type="button"
            className={styles.audioPhrase}
            onClick={() => {
              if (typeof window === "undefined") return;

              const utterance = new SpeechSynthesisUtterance(
                dailyMission.phraseAr,
              );
              utterance.lang = "ar-SA";
              utterance.rate = 0.78;
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(utterance);
            }}
          >
            <span className={styles.audioIcon}>🔊</span>
            <span>
              <strong>{dailyMission.phraseAr}</strong>
              <small>{dailyMission.phraseEn}</small>
            </span>
          </button>

          <div className={styles.missionOptions}>
            {[
              {
                id: "water",
                ar: "أريد ماءً، من فضلك.",
                en: "I would like water, please.",
                correct: false,
              },
              {
                id: "sandwich",
                ar: "أريد شطيرة، من فضلك.",
                en: "I would like a sandwich, please.",
                correct: true,
              },
              {
                id: "goodbye",
                ar: "إلى اللقاء.",
                en: "Goodbye.",
                correct: false,
              },
            ].map((answer) => {
              const chosen = missionChoice === answer.id;
              const showCorrect = missionComplete && answer.correct;
              const showWrong = chosen && !answer.correct;

              return (
                <button
                  key={answer.id}
                  type="button"
                  className={`${styles.missionOption} ${
                    showCorrect ? styles.missionOptionCorrect : ""
                  } ${showWrong ? styles.missionOptionWrong : ""}`}
                  onClick={() => chooseMission(answer.id, answer.correct)}
                >
                  <span>{isArabic ? answer.ar : answer.en}</span>
                  {showCorrect && <strong>✓</strong>}
                  {showWrong && <strong>×</strong>}
                </button>
              );
            })}
          </div>

          {missionComplete && (
            <div className={styles.successMessage}>
              <span>🎉</span>
              <div>
                <strong>
                  {isArabic
                    ? "أحسنت! استخدمت العربية بنجاح."
                    : "Well done! You used Arabic successfully."}
                </strong>
                <small>
                  {isArabic
                    ? "قل العبارة بصوتك الآن."
                    : "Now say the expression aloud."}
                </small>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.skillsSection} id="skills">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionKicker}>
              {isArabic ? "المهارات تعمل معًا" : "Skills working together"}
            </span>

            <h2>
              {isArabic
                ? "لا تحفظ اللغة، بل استخدمها"
                : "Do not memorise the language. Use it."}
            </h2>
          </div>

          <p>
            {isArabic
              ? "كل مهمة تجمع بين الاستماع والتحدث والقراءة والكتابة داخل سياق مفهوم."
              : "Every mission blends listening, speaking, reading and writing in a meaningful context."}
          </p>
        </div>

        <div className={styles.skillsGrid}>
          {skills.map((skill, index) => (
            <article className={styles.skillCard} key={skill.en}>
              <span className={styles.skillNumber}>0{index + 1}</span>
              <span className={styles.skillIcon}>{skill.icon}</span>
              <h3>{isArabic ? skill.ar : skill.en}</h3>
              <p>{isArabic ? skill.detailAr : skill.detailEn}</p>

              <div className={styles.skillMiniBar}>
                <span style={{ width: `${46 + index * 12}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.realLifeSection}>
        <div className={styles.realLifeVisual}>
          <div className={styles.lifeCardLarge}>
            <span>📍</span>
            <div>
              <small>{isArabic ? "المهمة القادمة" : "Next Mission"}</small>
              <strong>
                {isArabic ? "اسأل عن مكان المكتبة" : "Ask where the library is"}
              </strong>
            </div>
          </div>

          <div className={styles.lifeCardSmallOne}>
            <span>👋</span>
            {isArabic ? "تعارف" : "Meet people"}
          </div>

          <div className={styles.lifeCardSmallTwo}>
            <span>🚌</span>
            {isArabic ? "تنقّل" : "Get around"}
          </div>

          <div className={styles.lifeCardSmallThree}>
            <span>🛍️</span>
            {isArabic ? "تسوّق" : "Go shopping"}
          </div>
        </div>

        <div className={styles.realLifeCopy}>
          <span className={styles.sectionKicker}>
            {isArabic ? "العربية خارج الفصل" : "Arabic beyond the classroom"}
          </span>

          <h2>
            {isArabic
              ? "تعلم لغة تساعدك في المدرسة وفي المجتمع."
              : "Learn Arabic for school and for the world around you."}
          </h2>

          <p>
            {isArabic
              ? "المحتوى مبني حول مواقف يعيشها الطالب غير العربي في قطر: المدرسة، الأصدقاء، المتاجر، الأماكن، المناسبات والحياة اليومية."
              : "Content is built around situations international students experience in Qatar: school, friends, shops, places, occasions and daily life."}
          </p>

          <ul>
            <li>
              <span>✓</span>
              {isArabic
                ? "لغة عربية واضحة ومناسبة للعمر."
                : "Clear, age-appropriate Arabic."}
            </li>
            <li>
              <span>✓</span>
              {isArabic
                ? "دعم إنجليزي يظهر عند الحاجة."
                : "English support when needed."}
            </li>
            <li>
              <span>✓</span>
              {isArabic
                ? "تدرج من الفهم إلى الاستخدام المستقل."
                : "A progression from understanding to independent use."}
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <span className={styles.finalCtaIcon}>ب</span>

          <div>
            <small>BAYAN Arabic B</small>
            <h2>
              {isArabic
                ? "ابدأ من مستواك الحقيقي."
                : "Begin from your real starting point."}
            </h2>
            <p>
              {isArabic
                ? "ثمانية أسئلة قصيرة، ثم تحصل على مسار مقترح."
                : "Eight short questions, followed by a suggested pathway."}
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.finalCtaButton}
          onClick={openPlacement}
        >
          {isArabic ? "ابدأ الآن" : "Start Now"}
          <span>→</span>
        </button>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>King&apos;s College Doha</strong>
          <span>{isArabic ? "قسم اللغة العربية" : "Arabic Department"}</span>
        </div>

        <p>
          {isArabic
            ? "تعلم واضح، استخدام حقيقي، تقدم ثابت."
            : "Clear learning. Real use. Steady progress."}
        </p>

        <Link href="/">
          {isArabic ? "العودة إلى عالم بيان" : "Back to BAYAN World"}
        </Link>
      </footer>

      {levelExperienceOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setLevelExperienceOpen(false);
            }
          }}
        >
          <section
            className={styles.levelExperienceModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-experience-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <small>
                  {isArabic
                    ? `المستوى ${selectedLevelData.id}`
                    : `Level ${selectedLevelData.id}`}
                </small>

                <h2 id="level-experience-title">
                  {isArabic
                    ? selectedLevelData.titleAr
                    : selectedLevelData.titleEn}
                </h2>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setLevelExperienceOpen(false)}
                aria-label={isArabic ? "إغلاق" : "Close"}
              >
                ×
              </button>
            </div>

            <div className={styles.experienceProgress}>
              {[1, 2, 3, 4].map((step) => (
                <button
                  key={step}
                  type="button"
                  className={
                    previewStep === step ? styles.experienceProgressActive : ""
                  }
                  onClick={() => setPreviewStep(step)}
                >
                  <span>{step}</span>
                  <small>
                    {step === 1
                      ? isArabic
                        ? "استمع"
                        : "Listen"
                      : step === 2
                        ? isArabic
                          ? "افهم"
                          : "Understand"
                        : step === 3
                          ? isArabic
                            ? "تحدث"
                            : "Speak"
                          : isArabic
                            ? "اكتب"
                            : "Write"}
                  </small>
                </button>
              ))}
            </div>

            <div className={styles.experienceContent}>
              <span className={styles.experienceIcon}>
                {previewStep === 1
                  ? "🎧"
                  : previewStep === 2
                    ? "🖼️"
                    : previewStep === 3
                      ? "🎤"
                      : "✍️"}
              </span>

              <h3>
                {previewStep === 1
                  ? isArabic
                    ? "استمع إلى العبارة"
                    : "Listen to the expression"
                  : previewStep === 2
                    ? isArabic
                      ? "اختر المعنى الصحيح"
                      : "Choose the correct meaning"
                    : previewStep === 3
                      ? isArabic
                        ? "قل العبارة بصوتك"
                        : "Say the expression aloud"
                      : isArabic
                        ? "اكتب العبارة"
                        : "Write the expression"}
              </h3>

              <div className={styles.experiencePhrase}>
                <strong>
                  {selectedLevelData.id === "A0"
                    ? "ما اسمك؟"
                    : selectedLevelData.id === "A1"
                      ? "ماذا تحب أن تفعل؟"
                      : selectedLevelData.id === "A2"
                        ? "كيف أذهب إلى المكتبة؟"
                        : selectedLevelData.id === "B1"
                          ? "في رأيي، هذه فكرة مفيدة."
                          : "يمكننا تطوير المشروع بهذه الطريقة."}
                </strong>

                <small>
                  {selectedLevelData.id === "A0"
                    ? "What is your name?"
                    : selectedLevelData.id === "A1"
                      ? "What do you like to do?"
                      : selectedLevelData.id === "A2"
                        ? "How do I get to the library?"
                        : selectedLevelData.id === "B1"
                          ? "In my opinion, this is a useful idea."
                          : "We can develop the project in this way."}
                </small>
              </div>

              {previewStep === 1 && (
                <button
                  type="button"
                  className={styles.experiencePrimaryButton}
                  onClick={() => {
                    const phrase =
                      selectedLevelData.id === "A0"
                        ? "ما اسمك؟"
                        : selectedLevelData.id === "A1"
                          ? "ماذا تحب أن تفعل؟"
                          : selectedLevelData.id === "A2"
                            ? "كيف أذهب إلى المكتبة؟"
                            : selectedLevelData.id === "B1"
                              ? "في رأيي، هذه فكرة مفيدة."
                              : "يمكننا تطوير المشروع بهذه الطريقة.";

                    const utterance = new SpeechSynthesisUtterance(phrase);
                    utterance.lang = "ar-SA";
                    utterance.rate = 0.76;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                  }}
                >
                  🔊 {isArabic ? "تشغيل الصوت" : "Play Audio"}
                </button>
              )}

              {previewStep === 2 && (
                <div className={styles.understandingActivity}>
                  <p className={styles.understandingPrompt}>
                    {isArabic
                      ? "اختر المعنى الصحيح للعبارة:"
                      : "Choose the correct meaning of the Arabic expression:"}
                  </p>

                  <div className={styles.experienceAnswers}>
                    {currentExperience.meaningOptions.map((option) => {
                      const selected = meaningChoice === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={
                            selected
                              ? option.correct
                                ? styles.meaningCorrect
                                : styles.meaningWrong
                              : ""
                          }
                          onClick={() => {
                            setMeaningChoice(option.id);
                            setMeaningCorrect(option.correct);
                          }}
                        >
                          <span>{option.en}</span>

                          {selected && option.correct && <strong>✓</strong>}
                          {selected && !option.correct && <strong>×</strong>}
                        </button>
                      );
                    })}
                  </div>

                  {meaningChoice && (
                    <div
                      className={
                        meaningCorrect
                          ? styles.meaningFeedbackCorrect
                          : styles.meaningFeedbackWrong
                      }
                    >
                      {meaningCorrect
                        ? isArabic
                          ? "أحسنت، هذا هو المعنى الصحيح."
                          : "Correct. You understood the expression."
                        : isArabic
                          ? "ليست الإجابة الصحيحة. حاول مرة أخرى."
                          : "That is not correct. Try again."}
                    </div>
                  )}

                  {meaningCorrect && (
                    <button
                      type="button"
                      className={styles.continueWritingButton}
                      onClick={() => {
                        setSpokenText("");
                        setSpeakingComplete(false);
                        setIsListening(false);
                        setPreviewStep(3);
                      }}
                    >
                      {isArabic ? "متابعة إلى التحدث" : "Continue to Speaking"}
                      <span>→</span>
                    </button>
                  )}
                </div>
              )}

              {previewStep === 3 && (
                <div className={styles.speakingActivity}>
                  <button
                    type="button"
                    className={`${styles.experiencePrimaryButton} ${
                      isListening ? styles.listeningButton : ""
                    }`}
                    onClick={() => {
                      const SpeechRecognition =
                        window.SpeechRecognition ||
                        window.webkitSpeechRecognition;

                      if (!SpeechRecognition) {
                        setSpokenText(
                          isArabic
                            ? "المتصفح لا يدعم التعرف على الصوت. جرّب Google Chrome."
                            : "Speech recognition is not supported in this browser. Try Google Chrome.",
                        );
                        return;
                      }

                      const recognition = new SpeechRecognition();
                      recognition.lang = "ar-SA";
                      recognition.interimResults = false;
                      recognition.continuous = false;

                      setIsListening(true);
                      setSpokenText("");
                      setSpeakingComplete(false);

                      recognition.onresult = (event) => {
                        const transcript =
                          event.results?.[0]?.[0]?.transcript || "";

                        setSpokenText(transcript);
                        setSpeakingComplete(Boolean(transcript));
                      };

                      recognition.onerror = () => {
                        setSpokenText(
                          isArabic
                            ? "لم نتمكن من سماع العبارة بوضوح. حاول مرة أخرى."
                            : "We could not hear the expression clearly. Please try again.",
                        );
                      };

                      recognition.onend = () => {
                        setIsListening(false);
                      };

                      recognition.start();
                    }}
                  >
                    {isListening
                      ? isArabic
                        ? "🎙️ جارٍ الاستماع..."
                        : "🎙️ Listening..."
                      : isArabic
                        ? "🎤 ابدأ التحدث"
                        : "🎤 Start Speaking"}
                  </button>

                  <p className={styles.speakingHint}>
                    {isArabic
                      ? "قل العبارة الظاهرة بصوت واضح."
                      : "Say the displayed expression clearly."}
                  </p>

                  {spokenText && (
                    <div className={styles.spokenResult}>
                      <small>{isArabic ? "سمعنا:" : "We heard:"}</small>
                      <strong>{spokenText}</strong>
                    </div>
                  )}

                  {speakingComplete && (
                    <button
                      type="button"
                      className={styles.continueWritingButton}
                      onClick={() => setPreviewStep(4)}
                    >
                      {isArabic ? "متابعة إلى الكتابة" : "Continue to Writing"}
                      <span>→</span>
                    </button>
                  )}
                </div>
              )}

              {previewStep === 4 && (
                <textarea
                  className={styles.experienceTextarea}
                  placeholder={
                    isArabic
                      ? "اكتب إجابتك هنا..."
                      : "Write your answer here..."
                  }
                />
              )}
            </div>

            <div className={styles.experienceFooter}>
              <button
                type="button"
                disabled={previewStep === 1}
                onClick={() =>
                  setPreviewStep((current) => Math.max(1, current - 1))
                }
              >
                {isArabic ? "السابق" : "Previous"}
              </button>

              <button
                type="button"
                className={styles.experienceNextButton}
                onClick={() => {
                  if (previewStep === 3 && !speakingComplete) {
                    return;
                  }

                  if (previewStep < 4) {
                    setPreviewStep((current) => current + 1);
                  } else {
                    setLevelExperienceOpen(false);
                  }
                }}
              >
                {previewStep < 4
                  ? isArabic
                    ? "التالي"
                    : "Next"
                  : isArabic
                    ? "إنهاء المهمة"
                    : "Complete Mission"}
              </button>
            </div>
          </section>
        </div>
      )}

      {placementOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setPlacementOpen(false);
            }
          }}
        >
          <section
            className={styles.placementModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="placement-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <small>
                  {isArabic ? "اختبار قصير غير رسمي" : "A short informal check"}
                </small>
                <h2 id="placement-title">
                  {isArabic
                    ? "اكتشف نقطة البداية المناسبة"
                    : "Find your best starting point"}
                </h2>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setPlacementOpen(false)}
                aria-label={isArabic ? "إغلاق" : "Close"}
              >
                ×
              </button>
            </div>

            {!placementFinished ? (
              <>
                <div className={styles.progressHeader}>
                  <span>
                    {isArabic ? "السؤال" : "Question"} {questionIndex + 1}{" "}
                    {isArabic ? "من" : "of"} {placementQuestions.length}
                  </span>

                  <strong>
                    {Math.round(
                      ((questionIndex + 1) / placementQuestions.length) * 100,
                    )}
                    %
                  </strong>
                </div>

                <div className={styles.progressTrack}>
                  <span
                    style={{
                      width: `${
                        ((questionIndex + 1) / placementQuestions.length) * 100
                      }%`,
                    }}
                  />
                </div>

                <div className={styles.questionArea}>
                  <span className={styles.questionIcon}>
                    {questionIndex < 2 ? "👋" : questionIndex < 5 ? "💬" : "📚"}
                  </span>

                  <h3>
                    {isArabic
                      ? currentPlacementQuestion.promptAr
                      : currentPlacementQuestion.promptEn}
                  </h3>

                  {(currentPlacementQuestion.helperAr ||
                    currentPlacementQuestion.helperEn) && (
                    <p>
                      {isArabic
                        ? currentPlacementQuestion.helperAr
                        : currentPlacementQuestion.helperEn}
                    </p>
                  )}
                </div>

                <div className={styles.placementOptions}>
                  {currentPlacementQuestion.options.map((option, index) => (
                    <button
                      key={`${questionIndex}-${index}`}
                      type="button"
                      onClick={() => answerPlacement(option.score)}
                    >
                      <span>{String.fromCharCode(65 + index)}</span>
                      <strong>{isArabic ? option.ar : option.en}</strong>
                    </button>
                  ))}
                </div>

                <p className={styles.placementNote}>
                  {isArabic
                    ? "هذا الاختبار يقترح نقطة بداية فقط، ويمكنك اختيار أي مستوى."
                    : "This check only suggests a starting point. You may choose any level."}
                </p>
              </>
            ) : (
              <div className={styles.resultArea}>
                <div className={styles.resultCelebration}>
                  <span>✨</span>
                  <small>
                    {isArabic ? "المسار المقترح لك" : "Your suggested pathway"}
                  </small>
                </div>

                <div className={styles.resultLevel}>{level}</div>

                <h3>
                  {isArabic
                    ? `نقترح أن تبدأ من المستوى ${level}.`
                    : `We suggest starting from Level ${level}.`}
                </h3>

                <p>
                  {isArabic
                    ? "يمكنك البدء من هذا المستوى أو استكشاف مستوى آخر. هذا ليس اختبار نجاح أو رسوب."
                    : "You can begin here or explore another level. This is not a pass-or-fail test."}
                </p>

                <div className={styles.resultActions}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => {
                      if (level) setSelectedLevel(level);
                      setPlacementOpen(false);
                      window.setTimeout(() => {
                        document
                          .getElementById("journey")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                  >
                    {isArabic
                      ? `استكشف المستوى ${level}`
                      : `Explore Level ${level}`}
                  </button>

                  <button
                    type="button"
                    className={styles.restartButton}
                    onClick={restartPlacement}
                  >
                    {isArabic ? "إعادة الاختبار" : "Try Again"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
