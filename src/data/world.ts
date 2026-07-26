export type IconName =
  | "book"
  | "graduation"
  | "school"
  | "users"
  | "medal"
  | "calendar"
  | "images"
  | "newspaper"
  | "library"
  | "sparkles"
  | "file"
  | "video";

export type PortalSection = {
  slug: string;
  icon: IconName;
  ar: string;
  en: string;
  descriptionAr: string;
  descriptionEn: string;
  gradient: string;
};

export const sections: PortalSection[] = [
  {
    slug: "arabic-a",
    icon: "book",
    ar: "اللغة العربية أ",
    en: "Arabic A",
    descriptionAr: "مسار أكاديمي متكامل للناطقين باللغة العربية.",
    descriptionEn: "A complete academic pathway for native Arabic speakers.",
    gradient: "from-emerald-500 to-emerald-800",
  },
  {
    slug: "arabic-b",
    icon: "graduation",
    ar: "اللغة العربية ب",
    en: "Arabic B",
    descriptionAr: "رحلة ممتعة ومتدرجة لمتعلمي العربية.",
    descriptionEn: "A joyful, progressive journey for Arabic learners.",
    gradient: "from-orange-400 to-orange-600",
  },
  {
    slug: "students",
    icon: "school",
    ar: "بوابة الطلاب",
    en: "Student Portal",
    descriptionAr: "التحديات والواجبات والتقدم وإبداعات الطلاب.",
    descriptionEn: "Challenges, assignments, progress and student creativity.",
    gradient: "from-green-400 to-emerald-700",
  },
  {
    slug: "parents",
    icon: "users",
    ar: "بوابة أولياء الأمور",
    en: "Parent Portal",
    descriptionAr: "نافذة واضحة على رحلة تعلم الأبناء.",
    descriptionEn: "A clear window into every child's learning journey.",
    gradient: "from-amber-400 to-orange-600",
  },
  {
    slug: "achievements",
    icon: "medal",
    ar: "الإنجازات",
    en: "Achievements",
    descriptionAr: "الاحتفاء بالتميز والجوائز والنجاحات.",
    descriptionEn: "Celebrating excellence, awards and success.",
    gradient: "from-emerald-400 to-green-700",
  },
  {
    slug: "events",
    icon: "calendar",
    ar: "الفعاليات",
    en: "Events",
    descriptionAr: "المسابقات والاحتفالات والمبادرات الثقافية.",
    descriptionEn: "Competitions, celebrations and cultural initiatives.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    slug: "gallery",
    icon: "images",
    ar: "المعرض الإعلامي",
    en: "Media Gallery",
    descriptionAr: "صور وفيديوهات توثق حياة القسم.",
    descriptionEn: "Photos and videos capturing department life.",
    gradient: "from-teal-400 to-emerald-700",
  },
  {
    slug: "magazine",
    icon: "newspaper",
    ar: "المجلة الرقمية",
    en: "Digital Magazine",
    descriptionAr: "قصص ومقالات وأعمال طلابية إبداعية.",
    descriptionEn: "Stories, articles and creative student work.",
    gradient: "from-yellow-400 to-orange-600",
  },
  {
    slug: "resources",
    icon: "library",
    ar: "مكتبة الموارد",
    en: "Resources Hub",
    descriptionAr: "مواد وأنشطة وملفات تعليمية منظمة.",
    descriptionEn: "Organised educational materials and activities.",
    gradient: "from-green-500 to-emerald-800",
  },
  {
    slug: "creativity",
    icon: "sparkles",
    ar: "إبداعات الطلاب",
    en: "Student Creativity",
    descriptionAr: "مساحة لعرض الكتابة والفن والمشروعات.",
    descriptionEn: "A space for writing, art and digital projects.",
    gradient: "from-orange-400 to-rose-500",
  },
  {
    slug: "newsletter",
    icon: "file",
    ar: "النشرة الأسبوعية",
    en: "Weekly Newsletter",
    descriptionAr: "أبرز ما تعلمناه وما ينتظرنا الأسبوع القادم.",
    descriptionEn: "What we learned and what comes next.",
    gradient: "from-lime-500 to-green-700",
  },
  {
    slug: "studio",
    icon: "video",
    ar: "استوديو بيان",
    en: "Bayan Studio",
    descriptionAr: "مقابلات وقصص مرئية وإنتاج إعلامي طلابي.",
    descriptionEn: "Interviews, visual stories and student media.",
    gradient: "from-amber-500 to-orange-700",
  },
];

type ContentItem = {
  titleAr: string;
  titleEn: string;
  textAr: string;
  textEn: string;
  tagAr: string;
  tagEn: string;
};

export const sharedContent: Record<string, ContentItem[]> = {
  "arabic-a": [
    {
      titleAr: "القراءة والتحليل",
      titleEn: "Reading & Analysis",
      textAr: "نصوص أدبية ومعلوماتية تنمي الفهم والاستنتاج والتفكير النقدي.",
      textEn: "Literary and informational texts developing inference and critical thinking.",
      tagAr: "قراءة",
      tagEn: "Reading",
    },
    {
      titleAr: "الكتابة الإبداعية",
      titleEn: "Creative Writing",
      textAr: "ورش كتابة منظمة تساعد الطلاب على بناء صوتهم وأسلوبهم.",
      textEn: "Structured workshops helping students develop voice and style.",
      tagAr: "كتابة",
      tagEn: "Writing",
    },
    {
      titleAr: "البلاغة والنحو",
      titleEn: "Language & Rhetoric",
      textAr: "تطبيق اللغة في سياقات حقيقية بدلًا من الحفظ المجرد.",
      textEn: "Applying language in authentic contexts rather than isolated memorisation.",
      tagAr: "لغة",
      tagEn: "Language",
    },
  ],
  "arabic-b": [
    {
      titleAr: "تحدث بثقة",
      titleEn: "Speak Confidently",
      textAr: "مواقف تواصل يومية وألعاب لغوية تعزز الطلاقة.",
      textEn: "Everyday communication and language games building fluency.",
      tagAr: "تحدث",
      tagEn: "Speaking",
    },
    {
      titleAr: "مفرداتي الجديدة",
      titleEn: "My New Vocabulary",
      textAr: "تعلم المفردات من خلال الصور والقصص والمواقف.",
      textEn: "Learning vocabulary through pictures, stories and situations.",
      tagAr: "مفردات",
      tagEn: "Vocabulary",
    },
    {
      titleAr: "رحلة التقدم",
      titleEn: "Progress Journey",
      textAr: "مراحل واضحة وشارات تشجع المتعلم على الاستمرار.",
      textEn: "Clear stages and badges motivating continuous progress.",
      tagAr: "تقدم",
      tagEn: "Progress",
    },
  ],
  students: [
    {
      titleAr: "مهمتي هذا الأسبوع",
      titleEn: "My Weekly Mission",
      textAr: "تحدٍ قصير يجمع القراءة والكتابة والتحدث.",
      textEn: "A short challenge combining reading, writing and speaking.",
      tagAr: "تحدي",
      tagEn: "Challenge",
    },
    {
      titleAr: "شاراتي",
      titleEn: "My Badges",
      textAr: "اجمع الشارات من خلال المثابرة والإبداع والتعاون.",
      textEn: "Collect badges through perseverance, creativity and collaboration.",
      tagAr: "إنجاز",
      tagEn: "Achievement",
    },
    {
      titleAr: "أعمالي",
      titleEn: "My Portfolio",
      textAr: "مساحة لحفظ أفضل الكتابات والمشروعات.",
      textEn: "A space to showcase the best writing and projects.",
      tagAr: "ملف الطالب",
      tagEn: "Portfolio",
    },
  ],
  parents: [
    {
      titleAr: "ماذا يتعلم طفلي؟",
      titleEn: "What Is My Child Learning?",
      textAr: "ملخص واضح للمفاهيم والمهارات التي يدرسها الطالب.",
      textEn: "A clear summary of current concepts and skills.",
      tagAr: "التعلم",
      tagEn: "Learning",
    },
    {
      titleAr: "دعم التعلم في المنزل",
      titleEn: "Learning at Home",
      textAr: "أفكار بسيطة وعملية لدعم العربية خارج الصف.",
      textEn: "Simple, practical ideas for supporting Arabic beyond school.",
      tagAr: "المنزل",
      tagEn: "Home",
    },
    {
      titleAr: "التواصل مع القسم",
      titleEn: "Contact the Department",
      textAr: "قنوات واضحة للتواصل والاستفسار والمشاركة.",
      textEn: "Clear channels for communication and participation.",
      tagAr: "تواصل",
      tagEn: "Contact",
    },
  ],
};

const genericItems: ContentItem[] = [
  {
    titleAr: "أحدث الإضافات",
    titleEn: "Latest Updates",
    textAr: "تابع أحدث الأخبار والمواد والتجارب التي أضيفت إلى هذه المساحة.",
    textEn: "Discover the latest news, materials and experiences added here.",
    tagAr: "جديد",
    tagEn: "New",
  },
  {
    titleAr: "مختارات القسم",
    titleEn: "Department Picks",
    textAr: "محتوى مختار بعناية لعرض أفضل ما يقدمه الطلاب والمعلمون.",
    textEn: "Carefully selected content showcasing students and teachers.",
    tagAr: "مختارات",
    tagEn: "Featured",
  },
  {
    titleAr: "شارك معنا",
    titleEn: "Join In",
    textAr: "اكتشف كيف يمكنك المشاركة في أنشطة القسم ومبادراته.",
    textEn: "Find out how to participate in department activities and initiatives.",
    tagAr: "مشاركة",
    tagEn: "Participate",
  },
];

export function getContent(slug: string) {
  return sharedContent[slug] ?? genericItems;
}

export function getSection(slug: string) {
  return sections.find((section) => section.slug === slug);
}
