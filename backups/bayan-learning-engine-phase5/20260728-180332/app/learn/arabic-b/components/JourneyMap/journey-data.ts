export type JourneyStatus = "completed" | "current" | "locked";

export type JourneyStop = {
  id: string;
  level: "A0" | "A1" | "A2" | "B1" | "B2";
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon:
    | "school"
    | "canteen"
    | "library"
    | "market"
    | "hospital"
    | "airport"
    | "university";
  xp: number;
  progress: number;
  status: JourneyStatus;
  words: number;
  conversations: number;
  color: string;
  glow: string;
  missionsEn: string[];
  missionsAr: string[];
};

export const journeyStops: JourneyStop[] = [
  {
    id: "school",
    level: "A0",
    titleEn: "At School",
    titleAr: "في المدرسة",
    subtitleEn: "First words and introductions",
    subtitleAr: "الكلمات الأولى والتعارف",
    descriptionEn:
      "Meet your teacher, introduce yourself and understand the language of the classroom.",
    descriptionAr:
      "قابل معلمك، وعرّف بنفسك، وافهم لغة الصف الأساسية.",
    icon: "school",
    xp: 120,
    progress: 100,
    status: "completed",
    words: 38,
    conversations: 4,
    color: "#188566",
    glow: "rgba(51, 210, 157, 0.35)",
    missionsEn: [
      "Introduce yourself",
      "Understand classroom instructions",
      "Ask and answer simple questions",
    ],
    missionsAr: [
      "عرّف بنفسك",
      "افهم تعليمات الصف",
      "اسأل وأجب عن أسئلة بسيطة",
    ],
  },
  {
    id: "canteen",
    level: "A1",
    titleEn: "At the Canteen",
    titleAr: "في المقصف",
    subtitleEn: "Food, choices and polite requests",
    subtitleAr: "الطعام والاختيارات والطلبات المهذبة",
    descriptionEn:
      "Order food, ask about prices and express what you like or dislike.",
    descriptionAr:
      "اطلب الطعام، واسأل عن الأسعار، وعبّر عما تحب وما لا تحب.",
    icon: "canteen",
    xp: 160,
    progress: 56,
    status: "current",
    words: 52,
    conversations: 6,
    color: "#e2a91e",
    glow: "rgba(255, 205, 74, 0.38)",
    missionsEn: [
      "Order a meal",
      "Ask how much something costs",
      "Talk about favourite food",
    ],
    missionsAr: [
      "اطلب وجبة",
      "اسأل عن السعر",
      "تحدث عن طعامك المفضل",
    ],
  },
  {
    id: "library",
    level: "A1",
    titleEn: "At the Library",
    titleAr: "في المكتبة",
    subtitleEn: "Books, places and finding information",
    subtitleAr: "الكتب والأماكن والبحث عن المعلومات",
    descriptionEn:
      "Find a book, follow directions and talk about what you enjoy reading.",
    descriptionAr:
      "ابحث عن كتاب، واتبع الاتجاهات، وتحدث عما تستمتع بقراءته.",
    icon: "library",
    xp: 190,
    progress: 0,
    status: "locked",
    words: 64,
    conversations: 7,
    color: "#3285c7",
    glow: "rgba(76, 164, 232, 0.34)",
    missionsEn: [
      "Ask for a book",
      "Follow location directions",
      "Describe a story",
    ],
    missionsAr: [
      "اطلب كتابًا",
      "اتبع إرشادات المكان",
      "صف قصة",
    ],
  },
  {
    id: "market",
    level: "A2",
    titleEn: "At the Market",
    titleAr: "في السوق",
    subtitleEn: "Shopping, numbers and negotiation",
    subtitleAr: "التسوق والأرقام والتفاوض",
    descriptionEn:
      "Buy everyday items, compare products and hold a natural shopping conversation.",
    descriptionAr:
      "اشترِ احتياجاتك اليومية، وقارن بين المنتجات، وأجرِ حوارًا طبيعيًا.",
    icon: "market",
    xp: 240,
    progress: 0,
    status: "locked",
    words: 82,
    conversations: 9,
    color: "#c96b38",
    glow: "rgba(226, 122, 63, 0.34)",
    missionsEn: [
      "Ask about sizes and colours",
      "Compare two products",
      "Complete a purchase",
    ],
    missionsAr: [
      "اسأل عن المقاسات والألوان",
      "قارن بين منتجين",
      "أكمل عملية شراء",
    ],
  },
  {
    id: "hospital",
    level: "A2",
    titleEn: "At the Hospital",
    titleAr: "في المستشفى",
    subtitleEn: "Health, feelings and asking for help",
    subtitleAr: "الصحة والمشاعر وطلب المساعدة",
    descriptionEn:
      "Describe symptoms, understand basic medical questions and ask for support.",
    descriptionAr:
      "صف الأعراض، وافهم الأسئلة الطبية الأساسية، واطلب المساعدة.",
    icon: "hospital",
    xp: 280,
    progress: 0,
    status: "locked",
    words: 91,
    conversations: 10,
    color: "#cc5860",
    glow: "rgba(226, 91, 101, 0.32)",
    missionsEn: [
      "Describe how you feel",
      "Answer a doctor's questions",
      "Understand simple advice",
    ],
    missionsAr: [
      "صف شعورك",
      "أجب عن أسئلة الطبيب",
      "افهم نصيحة بسيطة",
    ],
  },
  {
    id: "airport",
    level: "B1",
    titleEn: "At the Airport",
    titleAr: "في المطار",
    subtitleEn: "Travel, questions and unexpected situations",
    subtitleAr: "السفر والأسئلة والمواقف غير المتوقعة",
    descriptionEn:
      "Check in, understand announcements and solve common travel problems.",
    descriptionAr:
      "أكمل إجراءات السفر، وافهم الإعلانات، وتعامل مع مشكلات السفر.",
    icon: "airport",
    xp: 340,
    progress: 0,
    status: "locked",
    words: 110,
    conversations: 12,
    color: "#725bc3",
    glow: "rgba(131, 101, 219, 0.34)",
    missionsEn: [
      "Check in for a flight",
      "Understand an announcement",
      "Explain a travel problem",
    ],
    missionsAr: [
      "أكمل إجراءات الرحلة",
      "افهم إعلانًا",
      "اشرح مشكلة في السفر",
    ],
  },
  {
    id: "university",
    level: "B2",
    titleEn: "At University",
    titleAr: "في الجامعة",
    subtitleEn: "Ideas, discussion and confident expression",
    subtitleAr: "الأفكار والنقاش والتعبير الواثق",
    descriptionEn:
      "Discuss ideas, give reasons, present opinions and communicate with confidence.",
    descriptionAr:
      "ناقش الأفكار، وقدّم الأسباب والآراء، وتواصل بثقة وطلاقة.",
    icon: "university",
    xp: 500,
    progress: 0,
    status: "locked",
    words: 145,
    conversations: 16,
    color: "#b79216",
    glow: "rgba(229, 191, 62, 0.34)",
    missionsEn: [
      "Join an academic discussion",
      "Present and support an opinion",
      "Respond to different viewpoints",
    ],
    missionsAr: [
      "شارك في نقاش أكاديمي",
      "قدّم رأيًا وادعمه",
      "استجب لوجهات نظر مختلفة",
    ],
  },
];
