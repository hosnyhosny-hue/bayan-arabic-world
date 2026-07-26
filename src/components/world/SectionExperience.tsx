"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Library,
  LockKeyhole,
  Mail,
  Medal,
  Newspaper,
  Palette,
  Parentheses,
  Play,
  Search,
  Sparkles,
  Star,
  Trophy,
  Upload,
  Users,
  Video,
} from "lucide-react";

import WorldHeader from "@/src/components/world/WorldHeader";
import { useWorld } from "@/src/context/WorldContext";

type BilingualText = {
  ar: string;
  en: string;
};

type FeatureCard = {
  icon: string;
  title: BilingualText;
  description: BilingualText;
  meta?: BilingualText;
  action?: BilingualText;
};

type Stat = {
  value: string;
  label: BilingualText;
};

type SectionPreset = {
  badge: BilingualText;
  title: BilingualText;
  highlight: BilingualText;
  description: BilingualText;
  cta: BilingualText;
  secondaryCta: BilingualText;
  theme: string;
  icon: string;
  stats: Stat[];
  tabs: BilingualText[];
  cards: FeatureCard[];
};

const iconMap = {
  book: BookOpen,
  award: Award,
  calendar: CalendarDays,
  gallery: ImageIcon,
  magazine: Newspaper,
  resources: Library,
  creativity: Palette,
  newsletter: Mail,
  studio: Video,
  students: GraduationCap,
  parents: Users,
  file: FileText,
  play: CirclePlay,
  trophy: Trophy,
  medal: Medal,
  upload: Upload,
  lock: LockKeyhole,
  grammar: Parentheses,
};

const presets: Record<string, SectionPreset> = {
  "arabic-a": {
    badge: {
      ar: "منهج اللغة العربية للناطقين بها",
      en: "Arabic for Native Speakers",
    },
    title: {
      ar: "اللغة العربية أ",
      en: "Arabic A",
    },
    highlight: {
      ar: "رحلة لغوية تبني الهوية",
      en: "A Language Journey That Builds Identity",
    },
    description: {
      ar: "مسار تعليمي متكامل يجمع القراءة والكتابة والنحو والأدب والتعبير الإبداعي في تجربة منظمة تناسب كل مرحلة.",
      en: "A complete learning pathway combining reading, writing, grammar, literature and creative expression in one structured experience.",
    },
    cta: { ar: "ابدأ التعلّم", en: "Start Learning" },
    secondaryCta: { ar: "استعرض الوحدات", en: "Explore Units" },
    theme: "emerald",
    icon: "book",
    stats: [
      { value: "12", label: { ar: "وحدة تعليمية", en: "Learning Units" } },
      { value: "48", label: { ar: "درسًا تفاعليًا", en: "Interactive Lessons" } },
      { value: "120+", label: { ar: "موردًا رقميًا", en: "Digital Resources" } },
      { value: "92%", label: { ar: "معدل الإنجاز", en: "Completion Rate" } },
    ],
    tabs: [
      { ar: "نظرة عامة", en: "Overview" },
      { ar: "الوحدات", en: "Units" },
      { ar: "القراءة", en: "Reading" },
      { ar: "النحو", en: "Grammar" },
      { ar: "الواجبات", en: "Homework" },
    ],
    cards: [
      {
        icon: "book",
        title: { ar: "آخر درس", en: "Latest Lesson" },
        description: {
          ar: "الهوية والانتماء: قراءة تحليلية وتدريبات لغوية متدرجة.",
          en: "Identity and belonging: analytical reading and progressive language tasks.",
        },
        meta: { ar: "35 دقيقة", en: "35 min" },
        action: { ar: "فتح الدرس", en: "Open Lesson" },
      },
      {
        icon: "grammar",
        title: { ar: "مختبر النحو", en: "Grammar Lab" },
        description: {
          ar: "تدريبات ذكية على الأساليب والتراكيب مع تغذية راجعة فورية.",
          en: "Smart practice on structures and styles with instant feedback.",
        },
        meta: { ar: "8 تدريبات", en: "8 Activities" },
        action: { ar: "ابدأ التدريب", en: "Start Practice" },
      },
      {
        icon: "file",
        title: { ar: "مهمة الكتابة", en: "Writing Task" },
        description: {
          ar: "اكتب نصًا وصفيًا مستلهمًا من البيئة القطرية.",
          en: "Write a descriptive text inspired by the Qatari environment.",
        },
        meta: { ar: "التسليم الخميس", en: "Due Thursday" },
        action: { ar: "عرض المهمة", en: "View Task" },
      },
    ],
  },

  "arabic-b": {
    badge: {
      ar: "العربية للناطقين بغيرها",
      en: "Arabic for Non-Native Speakers",
    },
    title: { ar: "اللغة العربية ب", en: "Arabic B" },
    highlight: {
      ar: "تعلّم العربية بثقة",
      en: "Learn Arabic With Confidence",
    },
    description: {
      ar: "تجربة مبسطة وعملية لبناء مهارات الاستماع والتحدث والقراءة والكتابة من خلال مواقف حياتية واقعية.",
      en: "A practical and accessible experience that develops listening, speaking, reading and writing through real-life contexts.",
    },
    cta: { ar: "ابدأ المستوى", en: "Start Level" },
    secondaryCta: { ar: "اختبار تحديد المستوى", en: "Placement Check" },
    theme: "orange",
    icon: "book",
    stats: [
      { value: "6", label: { ar: "مستويات", en: "Levels" } },
      { value: "36", label: { ar: "موضوعًا", en: "Topics" } },
      { value: "220", label: { ar: "مفردة أساسية", en: "Core Words" } },
      { value: "18", label: { ar: "محادثة عملية", en: "Dialogues" } },
    ],
    tabs: [
      { ar: "المستوى الحالي", en: "Current Level" },
      { ar: "المفردات", en: "Vocabulary" },
      { ar: "المحادثة", en: "Speaking" },
      { ar: "الاستماع", en: "Listening" },
      { ar: "التقدم", en: "Progress" },
    ],
    cards: [
      {
        icon: "play",
        title: { ar: "حوار الأسبوع", en: "Dialogue of the Week" },
        description: {
          ar: "في المدرسة: الاستئذان وطلب المساعدة والتعريف بالنفس.",
          en: "At school: asking permission, requesting help and introducing yourself.",
        },
        meta: { ar: "مستوى A2", en: "Level A2" },
        action: { ar: "استمع وكرر", en: "Listen & Repeat" },
      },
      {
        icon: "book",
        title: { ar: "بطاقات المفردات", en: "Vocabulary Cards" },
        description: {
          ar: "تعلّم عشرين كلمة جديدة بالصوت والصورة والجملة.",
          en: "Learn twenty new words through sound, image and sentence.",
        },
        meta: { ar: "20 كلمة", en: "20 Words" },
        action: { ar: "ابدأ", en: "Begin" },
      },
      {
        icon: "award",
        title: { ar: "تحدي النطق", en: "Pronunciation Challenge" },
        description: {
          ar: "سجّل صوتك وقارن نطقك بالنموذج الصحيح.",
          en: "Record your voice and compare your pronunciation with the model.",
        },
        meta: { ar: "5 دقائق", en: "5 min" },
        action: { ar: "ابدأ التحدي", en: "Start Challenge" },
      },
    ],
  },

  achievements: {
    badge: { ar: "نجاحات نفخر بها", en: "Success We Celebrate" },
    title: { ar: "الإنجازات", en: "Achievements" },
    highlight: {
      ar: "كل إنجاز يحكي قصة",
      en: "Every Achievement Tells a Story",
    },
    description: {
      ar: "مساحة تحتفي بتفوق طلابنا وإبداعهم ومشاركاتهم وإنجازاتهم الأكاديمية والثقافية.",
      en: "A space celebrating student excellence, creativity, participation and academic and cultural achievements.",
    },
    cta: { ar: "استعرض الإنجازات", en: "Explore Achievements" },
    secondaryCta: { ar: "إضافة إنجاز", en: "Add Achievement" },
    theme: "gold",
    icon: "trophy",
    stats: [
      { value: "128", label: { ar: "إنجازًا", en: "Achievements" } },
      { value: "42", label: { ar: "طالبًا مكرمًا", en: "Honoured Students" } },
      { value: "16", label: { ar: "مسابقة", en: "Competitions" } },
      { value: "9", label: { ar: "جوائز كبرى", en: "Major Awards" } },
    ],
    tabs: [
      { ar: "الأحدث", en: "Latest" },
      { ar: "الأكاديمية", en: "Academic" },
      { ar: "الثقافية", en: "Cultural" },
      { ar: "المسابقات", en: "Competitions" },
      { ar: "لوحة الشرف", en: "Honour Board" },
    ],
    cards: [
      {
        icon: "trophy",
        title: { ar: "نجم الشهر", en: "Student of the Month" },
        description: {
          ar: "تميز في القراءة والكتابة والمشاركة الصفية.",
          en: "Outstanding performance in reading, writing and class participation.",
        },
        meta: { ar: "يوليو 2026", en: "July 2026" },
        action: { ar: "عرض القصة", en: "View Story" },
      },
      {
        icon: "medal",
        title: { ar: "مسابقة الإلقاء", en: "Public Speaking Award" },
        description: {
          ar: "المركز الأول في مسابقة الإلقاء باللغة العربية.",
          en: "First place in the Arabic public speaking competition.",
        },
        meta: { ar: "المركز الأول", en: "1st Place" },
        action: { ar: "التفاصيل", en: "Details" },
      },
      {
        icon: "award",
        title: { ar: "فصل التميز", en: "Class of Excellence" },
        description: {
          ar: "أعلى معدل مشاركة وإنجاز للمهام خلال هذا الشهر.",
          en: "The highest task completion and engagement rate this month.",
        },
        meta: { ar: "الصف السابع", en: "Year 7" },
        action: { ar: "لوحة الشرف", en: "Honour Board" },
      },
    ],
  },

  events: {
    badge: { ar: "تعلم خارج الصف", en: "Learning Beyond the Classroom" },
    title: { ar: "الفعاليات", en: "Events" },
    highlight: {
      ar: "موعدنا مع تجربة جديدة",
      en: "Your Next Experience Starts Here",
    },
    description: {
      ar: "رزنامة تفاعلية للأنشطة والمسابقات والرحلات والاحتفالات والورش التعليمية.",
      en: "An interactive calendar for activities, competitions, trips, celebrations and learning workshops.",
    },
    cta: { ar: "عرض التقويم", en: "View Calendar" },
    secondaryCta: { ar: "تسجيل المشاركة", en: "Register Interest" },
    theme: "coral",
    icon: "calendar",
    stats: [
      { value: "8", label: { ar: "فعاليات قادمة", en: "Upcoming Events" } },
      { value: "3", label: { ar: "هذا الأسبوع", en: "This Week" } },
      { value: "240", label: { ar: "مشاركًا", en: "Participants" } },
      { value: "12", label: { ar: "ورشة", en: "Workshops" } },
    ],
    tabs: [
      { ar: "القادمة", en: "Upcoming" },
      { ar: "هذا الأسبوع", en: "This Week" },
      { ar: "المسابقات", en: "Competitions" },
      { ar: "الرحلات", en: "Trips" },
      { ar: "الأرشيف", en: "Archive" },
    ],
    cards: [
      {
        icon: "calendar",
        title: { ar: "أسبوع اللغة العربية", en: "Arabic Language Week" },
        description: {
          ar: "أنشطة يومية ومسابقات ومعارض طلابية متنوعة.",
          en: "Daily activities, competitions and student exhibitions.",
        },
        meta: { ar: "15 سبتمبر", en: "15 September" },
        action: { ar: "عرض البرنامج", en: "View Programme" },
      },
      {
        icon: "award",
        title: { ar: "تحدي القراءة", en: "Reading Challenge" },
        description: {
          ar: "تحدٍ مدرسي لتحفيز القراءة وبناء عادة يومية مستدامة.",
          en: "A school challenge promoting reading and sustainable daily habits.",
        },
        meta: { ar: "300 مشارك", en: "300 Participants" },
        action: { ar: "سجّل الآن", en: "Register Now" },
      },
      {
        icon: "play",
        title: { ar: "ورشة صناعة القصة", en: "Storytelling Workshop" },
        description: {
          ar: "ورشة عملية في التخطيط والكتابة والإلقاء.",
          en: "A practical workshop in planning, writing and delivery.",
        },
        meta: { ar: "المسرح المدرسي", en: "School Theatre" },
        action: { ar: "احجز مقعدك", en: "Reserve Seat" },
      },
    ],
  },

  gallery: {
    badge: { ar: "لحظات تستحق أن تُروى", en: "Moments Worth Sharing" },
    title: { ar: "المعرض الإعلامي", en: "Media Gallery" },
    highlight: {
      ar: "ذاكرة بصرية نابضة بالحياة",
      en: "A Living Visual Memory",
    },
    description: {
      ar: "صور وفيديوهات توثق أنشطة الطلاب وفعاليات القسم ومشروعات التعلم والإبداع.",
      en: "Photos and videos documenting student activities, department events, learning projects and creativity.",
    },
    cta: { ar: "فتح المعرض", en: "Open Gallery" },
    secondaryCta: { ar: "رفع وسائط", en: "Upload Media" },
    theme: "teal",
    icon: "gallery",
    stats: [
      { value: "24", label: { ar: "ألبومًا", en: "Albums" } },
      { value: "680", label: { ar: "صورة", en: "Photos" } },
      { value: "42", label: { ar: "فيديو", en: "Videos" } },
      { value: "18K", label: { ar: "مشاهدة", en: "Views" } },
    ],
    tabs: [
      { ar: "الكل", en: "All" },
      { ar: "الصور", en: "Photos" },
      { ar: "الفيديو", en: "Videos" },
      { ar: "الفعاليات", en: "Events" },
      { ar: "أعمال الطلاب", en: "Student Work" },
    ],
    cards: [
      {
        icon: "gallery",
        title: { ar: "معرض الخط العربي", en: "Arabic Calligraphy Exhibition" },
        description: {
          ar: "مجموعة مختارة من إبداعات الطلاب في فنون الخط.",
          en: "A curated collection of student Arabic calligraphy work.",
        },
        meta: { ar: "36 صورة", en: "36 Photos" },
        action: { ar: "فتح الألبوم", en: "Open Album" },
      },
      {
        icon: "play",
        title: { ar: "يوم التراث", en: "Heritage Day" },
        description: {
          ar: "فيديو يوثق الفعاليات والعروض والمشاركات الطلابية.",
          en: "A video documenting activities, performances and student participation.",
        },
        meta: { ar: "04:28 دقيقة", en: "04:28 min" },
        action: { ar: "تشغيل الفيديو", en: "Play Video" },
      },
      {
        icon: "gallery",
        title: { ar: "مشروعات الصف التاسع", en: "Year 9 Projects" },
        description: {
          ar: "مشروعات بحثية وإبداعية حول اللغة والهوية.",
          en: "Research and creative projects exploring language and identity.",
        },
        meta: { ar: "18 مشروعًا", en: "18 Projects" },
        action: { ar: "استعرض الأعمال", en: "Explore Work" },
      },
    ],
  },

  magazine: {
    badge: { ar: "النشر الرقمي المدرسي", en: "School Digital Publishing" },
    title: { ar: "المجلة الرقمية", en: "Digital Magazine" },
    highlight: {
      ar: "قصص وأفكار بصوت طلابنا",
      en: "Stories and Ideas in Student Voices",
    },
    description: {
      ar: "مجلة تفاعلية تجمع المقالات والقصص والحوارات والإبداعات والأخبار في تجربة قراءة أنيقة.",
      en: "An interactive magazine bringing together articles, stories, interviews, creativity and news in an elegant reading experience.",
    },
    cta: { ar: "اقرأ العدد الجديد", en: "Read Latest Issue" },
    secondaryCta: { ar: "الأعداد السابقة", en: "Previous Issues" },
    theme: "amber",
    icon: "magazine",
    stats: [
      { value: "18", label: { ar: "عددًا منشورًا", en: "Published Issues" } },
      { value: "94", label: { ar: "مقالًا", en: "Articles" } },
      { value: "56", label: { ar: "كاتبًا طالبًا", en: "Student Writers" } },
      { value: "31K", label: { ar: "قراءة", en: "Reads" } },
    ],
    tabs: [
      { ar: "العدد الجديد", en: "Latest Issue" },
      { ar: "المقالات", en: "Articles" },
      { ar: "القصص", en: "Stories" },
      { ar: "الحوارات", en: "Interviews" },
      { ar: "الأرشيف", en: "Archive" },
    ],
    cards: [
      {
        icon: "magazine",
        title: { ar: "العدد 18", en: "Issue 18" },
        description: {
          ar: "عدد خاص بالإبداع والهوية والذكاء الاصطناعي في التعليم.",
          en: "A special issue on creativity, identity and AI in education.",
        },
        meta: { ar: "42 صفحة", en: "42 Pages" },
        action: { ar: "تصفّح العدد", en: "Read Issue" },
      },
      {
        icon: "file",
        title: { ar: "مقال الأسبوع", en: "Article of the Week" },
        description: {
          ar: "كيف تصنع القراءة شخصية الطالب وتوسّع آفاقه؟",
          en: "How does reading shape student character and expand horizons?",
        },
        meta: { ar: "6 دقائق قراءة", en: "6 min read" },
        action: { ar: "اقرأ المقال", en: "Read Article" },
      },
      {
        icon: "upload",
        title: { ar: "شارك بعملك", en: "Submit Your Work" },
        description: {
          ar: "أرسل مقالك أو قصتك أو تصميمك للنشر في العدد القادم.",
          en: "Submit your article, story or design for the next issue.",
        },
        meta: { ar: "مفتوح الآن", en: "Open Now" },
        action: { ar: "إرسال مشاركة", en: "Submit Entry" },
      },
    ],
  },

  resources: {
    badge: { ar: "مكتبة بيان الرقمية", en: "Bayan Digital Library" },
    title: { ar: "مكتبة الموارد", en: "Resources Hub" },
    highlight: {
      ar: "كل ما تحتاجه في مكان واحد",
      en: "Everything You Need in One Place",
    },
    description: {
      ar: "مكتبة منظمة للملفات والعروض وأوراق العمل والفيديوهات والمصادر المساندة.",
      en: "An organised library of files, presentations, worksheets, videos and supporting resources.",
    },
    cta: { ar: "استكشف المكتبة", en: "Explore Library" },
    secondaryCta: { ar: "رفع مورد", en: "Upload Resource" },
    theme: "green",
    icon: "resources",
    stats: [
      { value: "320", label: { ar: "موردًا", en: "Resources" } },
      { value: "72", label: { ar: "ورقة عمل", en: "Worksheets" } },
      { value: "48", label: { ar: "عرضًا", en: "Presentations" } },
      { value: "66", label: { ar: "فيديو", en: "Videos" } },
    ],
    tabs: [
      { ar: "الكل", en: "All" },
      { ar: "أوراق العمل", en: "Worksheets" },
      { ar: "العروض", en: "Presentations" },
      { ar: "الفيديو", en: "Videos" },
      { ar: "المعلمون", en: "Teachers" },
    ],
    cards: [
      {
        icon: "file",
        title: { ar: "أوراق القراءة المتدرجة", en: "Guided Reading Pack" },
        description: {
          ar: "نصوص وأنشطة متنوعة لدعم الفهم والاستيعاب.",
          en: "Texts and activities supporting comprehension and understanding.",
        },
        meta: { ar: "PDF • 4.2 MB", en: "PDF • 4.2 MB" },
        action: { ar: "تحميل", en: "Download" },
      },
      {
        icon: "play",
        title: { ar: "شرح أساليب البلاغة", en: "Rhetorical Devices Video" },
        description: {
          ar: "شرح مبسط مدعوم بالأمثلة والتطبيقات.",
          en: "A clear explanation supported by examples and applications.",
        },
        meta: { ar: "12 دقيقة", en: "12 min" },
        action: { ar: "مشاهدة", en: "Watch" },
      },
      {
        icon: "file",
        title: { ar: "بنك الأسئلة", en: "Question Bank" },
        description: {
          ar: "أسئلة مراجعة مصنفة حسب المهارة والمستوى.",
          en: "Revision questions organised by skill and level.",
        },
        meta: { ar: "85 سؤالًا", en: "85 Questions" },
        action: { ar: "فتح المورد", en: "Open Resource" },
      },
    ],
  },

  creativity: {
    badge: { ar: "مختبر الإبداع الطلابي", en: "Student Creativity Lab" },
    title: { ar: "إبداعات الطلاب", en: "Student Creativity" },
    highlight: {
      ar: "فكرتك تستحق أن تُرى",
      en: "Your Idea Deserves to Be Seen",
    },
    description: {
      ar: "منصة لعرض القصص والقصائد والتصاميم والبودكاست والمشروعات الرقمية التي يصنعها الطلاب.",
      en: "A platform showcasing stories, poetry, design, podcasts and digital projects created by students.",
    },
    cta: { ar: "استكشف الإبداعات", en: "Explore Creations" },
    secondaryCta: { ar: "أرسل إبداعك", en: "Submit Creation" },
    theme: "pink",
    icon: "creativity",
    stats: [
      { value: "146", label: { ar: "عملًا إبداعيًا", en: "Creative Works" } },
      { value: "68", label: { ar: "مبدعًا", en: "Creators" } },
      { value: "24", label: { ar: "قصة", en: "Stories" } },
      { value: "18", label: { ar: "بودكاست", en: "Podcasts" } },
    ],
    tabs: [
      { ar: "المختارات", en: "Featured" },
      { ar: "القصص", en: "Stories" },
      { ar: "الشعر", en: "Poetry" },
      { ar: "التصميم", en: "Design" },
      { ar: "الصوت", en: "Audio" },
    ],
    cards: [
      {
        icon: "file",
        title: { ar: "قصة: المدينة الخضراء", en: "Story: The Green City" },
        description: {
          ar: "قصة مستقبلية كتبها وصممها طلاب الصف الثامن.",
          en: "A futuristic story written and designed by Year 8 students.",
        },
        meta: { ar: "قصة مصورة", en: "Illustrated Story" },
        action: { ar: "اقرأ القصة", en: "Read Story" },
      },
      {
        icon: "play",
        title: { ar: "بودكاست أصواتنا", en: "Our Voices Podcast" },
        description: {
          ar: "حلقة حول أثر اللغة في بناء الهوية.",
          en: "An episode exploring the role of language in identity.",
        },
        meta: { ar: "08:40 دقيقة", en: "08:40 min" },
        action: { ar: "استمع الآن", en: "Listen Now" },
      },
      {
        icon: "gallery",
        title: { ar: "ملصقات اليوم الوطني", en: "National Day Posters" },
        description: {
          ar: "تصاميم فنية تعبر عن الثقافة والتراث والولاء.",
          en: "Artistic designs celebrating culture, heritage and belonging.",
        },
        meta: { ar: "16 تصميمًا", en: "16 Designs" },
        action: { ar: "عرض المعرض", en: "View Gallery" },
      },
    ],
  },

  newsletter: {
    badge: { ar: "أخبار القسم أسبوعيًا", en: "Weekly Department Updates" },
    title: { ar: "النشرة الأسبوعية", en: "Weekly Newsletter" },
    highlight: {
      ar: "ابقَ على اطلاع دائم",
      en: "Stay Connected Every Week",
    },
    description: {
      ar: "ملخص أسبوعي للأخبار والإنجازات والفعاليات والمواد القادمة وروابط التعلم المهمة.",
      en: "A weekly summary of news, achievements, events, upcoming learning and key links.",
    },
    cta: { ar: "اقرأ النشرة", en: "Read Newsletter" },
    secondaryCta: { ar: "اشترك الآن", en: "Subscribe Now" },
    theme: "lime",
    icon: "newsletter",
    stats: [
      { value: "34", label: { ar: "نشرة", en: "Issues" } },
      { value: "1.2K", label: { ar: "مشترك", en: "Subscribers" } },
      { value: "78%", label: { ar: "معدل القراءة", en: "Open Rate" } },
      { value: "96", label: { ar: "خبرًا", en: "Updates" } },
    ],
    tabs: [
      { ar: "هذا الأسبوع", en: "This Week" },
      { ar: "أخبار القسم", en: "Department News" },
      { ar: "نجوم الأسبوع", en: "Weekly Stars" },
      { ar: "الأسبوع القادم", en: "Next Week" },
      { ar: "الأرشيف", en: "Archive" },
    ],
    cards: [
      {
        icon: "newsletter",
        title: { ar: "نشرة الأسبوع 34", en: "Newsletter 34" },
        description: {
          ar: "أبرز أخبار القسم ونجوم الأسبوع وما ينتظر الطلاب.",
          en: "Department highlights, weekly stars and what is coming next.",
        },
        meta: { ar: "27 يوليو 2026", en: "27 July 2026" },
        action: { ar: "قراءة النشرة", en: "Read Newsletter" },
      },
      {
        icon: "award",
        title: { ar: "نجوم الأسبوع", en: "Weekly Stars" },
        description: {
          ar: "طلاب تميزوا في الجهد والمشاركة والإبداع.",
          en: "Students recognised for effort, engagement and creativity.",
        },
        meta: { ar: "12 طالبًا", en: "12 Students" },
        action: { ar: "عرض النجوم", en: "View Stars" },
      },
      {
        icon: "calendar",
        title: { ar: "الأسبوع القادم", en: "Coming Next Week" },
        description: {
          ar: "اختبارات قصيرة وورش وأنشطة وفعاليات جديدة.",
          en: "Quizzes, workshops, activities and new events.",
        },
        meta: { ar: "5 تحديثات", en: "5 Updates" },
        action: { ar: "عرض الخطة", en: "View Plan" },
      },
    ],
  },

  studio: {
    badge: { ar: "استوديو بيان للإنتاج", en: "Bayan Production Studio" },
    title: { ar: "استوديو بيان", en: "Bayan Studio" },
    highlight: {
      ar: "نحوّل المعرفة إلى محتوى",
      en: "Turning Knowledge Into Content",
    },
    description: {
      ar: "مساحة لإنتاج الفيديوهات التعليمية والبودكاست والقصص المصورة والمشروعات الرقمية.",
      en: "A creative space for producing educational videos, podcasts, visual stories and digital projects.",
    },
    cta: { ar: "دخول الاستوديو", en: "Enter Studio" },
    secondaryCta: { ar: "إنشاء مشروع", en: "Create Project" },
    theme: "orange",
    icon: "studio",
    stats: [
      { value: "72", label: { ar: "فيديو", en: "Videos" } },
      { value: "24", label: { ar: "حلقة صوتية", en: "Audio Episodes" } },
      { value: "36", label: { ar: "مشروعًا", en: "Projects" } },
      { value: "84", label: { ar: "مشاركًا", en: "Contributors" } },
    ],
    tabs: [
      { ar: "أحدث الإنتاجات", en: "Latest Productions" },
      { ar: "الفيديو", en: "Video" },
      { ar: "البودكاست", en: "Podcast" },
      { ar: "قوالب", en: "Templates" },
      { ar: "مشروعاتي", en: "My Projects" },
    ],
    cards: [
      {
        icon: "play",
        title: { ar: "اللغة في دقيقة", en: "Arabic in a Minute" },
        description: {
          ar: "فيديوهات قصيرة تبسط المفاهيم والقواعد.",
          en: "Short videos simplifying language concepts and grammar.",
        },
        meta: { ar: "18 حلقة", en: "18 Episodes" },
        action: { ar: "مشاهدة السلسلة", en: "Watch Series" },
      },
      {
        icon: "studio",
        title: { ar: "أنشئ فيديو تعليميًا", en: "Create a Learning Video" },
        description: {
          ar: "ابدأ من قالب جاهز وأضف النص والصوت والصور.",
          en: "Start with a template and add text, audio and visuals.",
        },
        meta: { ar: "قالب سريع", en: "Quick Template" },
        action: { ar: "ابدأ الإنشاء", en: "Start Creating" },
      },
      {
        icon: "upload",
        title: { ar: "مكتبتي الإعلامية", en: "My Media Library" },
        description: {
          ar: "إدارة الصور والفيديوهات والتسجيلات المستخدمة.",
          en: "Manage the images, videos and recordings used in projects.",
        },
        meta: { ar: "128 ملفًا", en: "128 Files" },
        action: { ar: "فتح المكتبة", en: "Open Library" },
      },
    ],
  },

  students: {
    badge: { ar: "مساحتك التعليمية الشخصية", en: "Your Personal Learning Space" },
    title: { ar: "بوابة الطالب", en: "Student Portal" },
    highlight: {
      ar: "تعلّم وتقدّم وأنجز",
      en: "Learn, Progress and Achieve",
    },
    description: {
      ar: "لوحة شخصية تجمع الدروس والمهام والإنجازات والموارد والتقدم في مكان واحد.",
      en: "A personal dashboard bringing lessons, assignments, achievements, resources and progress together.",
    },
    cta: { ar: "دخول البوابة", en: "Enter Portal" },
    secondaryCta: { ar: "عرض مهامي", en: "View My Tasks" },
    theme: "emerald",
    icon: "students",
    stats: [
      { value: "7", label: { ar: "مهام نشطة", en: "Active Tasks" } },
      { value: "84%", label: { ar: "التقدم", en: "Progress" } },
      { value: "12", label: { ar: "شارة", en: "Badges" } },
      { value: "18", label: { ar: "موردًا محفوظًا", en: "Saved Resources" } },
    ],
    tabs: [
      { ar: "لوحتي", en: "Dashboard" },
      { ar: "مهامي", en: "My Tasks" },
      { ar: "دروسي", en: "My Lessons" },
      { ar: "إنجازاتي", en: "Achievements" },
      { ar: "ملف التعلم", en: "Learning Profile" },
    ],
    cards: [
      {
        icon: "file",
        title: { ar: "مهمة مستحقة", en: "Upcoming Assignment" },
        description: {
          ar: "تحليل نص أدبي وتحديد الصور الجمالية.",
          en: "Analyse a literary text and identify figurative language.",
        },
        meta: { ar: "باقي يومان", en: "2 Days Left" },
        action: { ar: "فتح المهمة", en: "Open Assignment" },
      },
      {
        icon: "book",
        title: { ar: "واصل التعلّم", en: "Continue Learning" },
        description: {
          ar: "الوحدة الثالثة: اللغة والهوية.",
          en: "Unit Three: Language and Identity.",
        },
        meta: { ar: "68% مكتمل", en: "68% Complete" },
        action: { ar: "متابعة", en: "Continue" },
      },
      {
        icon: "award",
        title: { ar: "شارة جديدة", en: "New Badge" },
        description: {
          ar: "حصلت على شارة القارئ المثابر.",
          en: "You earned the Persistent Reader badge.",
        },
        meta: { ar: "اليوم", en: "Today" },
        action: { ar: "عرض الشارات", en: "View Badges" },
      },
    ],
  },

  parents: {
    badge: { ar: "شراكة المدرسة والأسرة", en: "School–Family Partnership" },
    title: { ar: "بوابة ولي الأمر", en: "Parent Portal" },
    highlight: {
      ar: "كن قريبًا من رحلة ابنك",
      en: "Stay Close to Your Child’s Journey",
    },
    description: {
      ar: "متابعة التقدم والمهام والحضور والإنجازات والتواصل مع القسم عبر مساحة واضحة وآمنة.",
      en: "Follow progress, tasks, attendance, achievements and communication through a clear and secure space.",
    },
    cta: { ar: "دخول آمن", en: "Secure Login" },
    secondaryCta: { ar: "تواصل معنا", en: "Contact Us" },
    theme: "amber",
    icon: "parents",
    stats: [
      { value: "94%", label: { ar: "نسبة الحضور", en: "Attendance" } },
      { value: "8", label: { ar: "مهام مكتملة", en: "Completed Tasks" } },
      { value: "4", label: { ar: "إنجازات جديدة", en: "New Achievements" } },
      { value: "2", label: { ar: "رسائل جديدة", en: "New Messages" } },
    ],
    tabs: [
      { ar: "نظرة عامة", en: "Overview" },
      { ar: "التقدم", en: "Progress" },
      { ar: "المهام", en: "Assignments" },
      { ar: "الحضور", en: "Attendance" },
      { ar: "الرسائل", en: "Messages" },
    ],
    cards: [
      {
        icon: "award",
        title: { ar: "ملخص التقدم", en: "Progress Summary" },
        description: {
          ar: "تقدم جيد في القراءة ومطلوب دعم إضافي في الكتابة.",
          en: "Strong progress in reading with additional support needed in writing.",
        },
        meta: { ar: "تحديث اليوم", en: "Updated Today" },
        action: { ar: "عرض التقرير", en: "View Report" },
      },
      {
        icon: "calendar",
        title: { ar: "الموعد القادم", en: "Next Meeting" },
        description: {
          ar: "لقاء متابعة تعلم الطالب مع معلم المادة.",
          en: "A learning progress meeting with the subject teacher.",
        },
        meta: { ar: "الأحد 3:30", en: "Sunday 3:30" },
        action: { ar: "عرض الموعد", en: "View Meeting" },
      },
      {
        icon: "lock",
        title: { ar: "تواصل آمن", en: "Secure Communication" },
        description: {
          ar: "أرسل استفسارًا أو رسالة مباشرة إلى فريق القسم.",
          en: "Send a query or direct message to the department team.",
        },
        meta: { ar: "رد خلال يوم عمل", en: "Reply within 1 day" },
        action: { ar: "إرسال رسالة", en: "Send Message" },
      },
    ],
  },
};

const fallbackPreset: SectionPreset = {
  badge: { ar: "تجربة بيان التعليمية", en: "Bayan Learning Experience" },
  title: { ar: "عالم بيان", en: "Bayan World" },
  highlight: {
    ar: "تعلم يصنع الفرق",
    en: "Learning That Makes a Difference",
  },
  description: {
    ar: "مساحة تعليمية حديثة تجمع المحتوى والتفاعل والإنجاز والإبداع.",
    en: "A modern learning space bringing together content, interaction, achievement and creativity.",
  },
  cta: { ar: "ابدأ الآن", en: "Get Started" },
  secondaryCta: { ar: "استكشف المحتوى", en: "Explore Content" },
  theme: "emerald",
  icon: "book",
  stats: [
    { value: "24", label: { ar: "موردًا", en: "Resources" } },
    { value: "12", label: { ar: "نشاطًا", en: "Activities" } },
    { value: "8", label: { ar: "موضوعات", en: "Topics" } },
    { value: "94%", label: { ar: "رضا المستخدمين", en: "User Satisfaction" } },
  ],
  tabs: [
    { ar: "نظرة عامة", en: "Overview" },
    { ar: "المحتوى", en: "Content" },
    { ar: "المصادر", en: "Resources" },
  ],
  cards: [
    {
      icon: "book",
      title: { ar: "محتوى تفاعلي", en: "Interactive Content" },
      description: {
        ar: "محتوى منظم يساعد على الاستكشاف والتعلّم.",
        en: "Structured content supporting exploration and learning.",
      },
      action: { ar: "استكشف", en: "Explore" },
    },
  ],
};

function text(value: BilingualText, isArabic: boolean) {
  return isArabic ? value.ar : value.en;
}

export default function SectionExperience({ slug }: { slug: string }) {
  const { isArabic, playSound } = useWorld();
  const preset = presets[slug] ?? fallbackPreset;
  const MainIcon = iconMap[preset.icon as keyof typeof iconMap] ?? BookOpen;
  const DirectionArrow = isArabic ? ArrowLeft : ArrowRight;

  return (
    <main
      className={`experience-page experience-theme-${preset.theme}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <WorldHeader />

      <div className="experience-shell">
        <section className="experience-hero">
          <div className="experience-hero-content">
            <Link
              href="/"
              className="experience-back"
              onClick={() => playSound("click")}
            >
              {isArabic ? <ArrowRight size={17} /> : <ArrowLeft size={17} />}
              {isArabic ? "العودة إلى الرئيسية" : "Back to Home"}
            </Link>

            <div className="experience-eyebrow">
              <Sparkles size={16} />
              {text(preset.badge, isArabic)}
            </div>

            <h1>{text(preset.title, isArabic)}</h1>
            <h2>{text(preset.highlight, isArabic)}</h2>
            <p>{text(preset.description, isArabic)}</p>

            <div className="experience-actions">
              <button
                type="button"
                className="experience-primary-button"
                onClick={() => playSound("success")}
              >
                {text(preset.cta, isArabic)}
                <DirectionArrow size={18} />
              </button>

              <button
                type="button"
                className="experience-secondary-button"
                onClick={() => playSound("click")}
              >
                {text(preset.secondaryCta, isArabic)}
              </button>
            </div>
          </div>

          <div className="experience-hero-art" aria-hidden="true">
            <div className="experience-orbit orbit-one" />
            <div className="experience-orbit orbit-two" />

            <div className="experience-main-icon">
              <MainIcon size={72} strokeWidth={1.55} />
            </div>

            <div className="experience-floating-card floating-card-one">
              <Star size={17} fill="currentColor" />
              <span>{isArabic ? "تجربة متميزة" : "Premium Experience"}</span>
            </div>

            <div className="experience-floating-card floating-card-two">
              <CheckCircle2 size={18} />
              <span>{isArabic ? "محتوى موثوق" : "Trusted Content"}</span>
            </div>
          </div>
        </section>

        <section className="experience-stats">
          {preset.stats.map((stat) => (
            <article key={`${stat.value}-${stat.label.en}`}>
              <strong>{stat.value}</strong>
              <span>{text(stat.label, isArabic)}</span>
            </article>
          ))}
        </section>

        <section className="experience-workspace">
          <div className="experience-toolbar">
            <div className="experience-tabs">
              {preset.tabs.map((tab, index) => (
                <button
                  type="button"
                  className={index === 0 ? "active" : ""}
                  key={tab.en}
                  onClick={() => playSound("click")}
                >
                  {text(tab, isArabic)}
                </button>
              ))}
            </div>

            <label className="experience-search">
              <Search size={18} />
              <input
                type="search"
                placeholder={
                  isArabic ? "ابحث داخل القسم..." : "Search this section..."
                }
              />
            </label>
          </div>

          <div className="experience-section-heading">
            <div>
              <span>{isArabic ? "المحتوى المختار" : "Featured Content"}</span>
              <h3>
                {isArabic
                  ? "ابدأ من حيث يناسبك"
                  : "Start Wherever Works for You"}
              </h3>
            </div>

            <button type="button">
              {isArabic ? "عرض الكل" : "View All"}
              <DirectionArrow size={17} />
            </button>
          </div>

          <div className="experience-card-grid">
            {preset.cards.map((card, index) => {
              const CardIcon =
                iconMap[card.icon as keyof typeof iconMap] ?? BookOpen;

              return (
                <article className="experience-card" key={card.title.en}>
                  <div className="experience-card-top">
                    <div className="experience-card-icon">
                      <CardIcon size={25} />
                    </div>

                    <span className="experience-card-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {card.meta && (
                    <span className="experience-card-meta">
                      <Clock3 size={14} />
                      {text(card.meta, isArabic)}
                    </span>
                  )}

                  <h4>{text(card.title, isArabic)}</h4>
                  <p>{text(card.description, isArabic)}</p>

                  <button
                    type="button"
                    onClick={() => playSound("click")}
                    className="experience-card-action"
                  >
                    {card.action
                      ? text(card.action, isArabic)
                      : isArabic
                        ? "فتح"
                        : "Open"}

                    <DirectionArrow size={17} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="experience-lower-grid">
          <article className="experience-progress-panel">
            <div className="experience-panel-header">
              <div>
                <span>{isArabic ? "نظرة سريعة" : "Quick Overview"}</span>
                <h3>{isArabic ? "تقدم هذا الأسبوع" : "This Week’s Progress"}</h3>
              </div>

              <div className="experience-progress-score">84%</div>
            </div>

            <div className="experience-progress-track">
              <span />
            </div>

            <div className="experience-progress-items">
              <div>
                <CheckCircle2 size={18} />
                <span>{isArabic ? "3 مهام مكتملة" : "3 Tasks Completed"}</span>
              </div>
              <div>
                <BookOpen size={18} />
                <span>{isArabic ? "درسان جديدان" : "2 New Lessons"}</span>
              </div>
              <div>
                <Award size={18} />
                <span>{isArabic ? "شارة جديدة" : "1 New Badge"}</span>
              </div>
            </div>
          </article>

          <article className="experience-update-panel">
            <span>{isArabic ? "آخر تحديث" : "Latest Update"}</span>
            <h3>
              {isArabic
                ? "محتوى جديد أضيف إلى هذا القسم"
                : "New Content Has Been Added"}
            </h3>
            <p>
              {isArabic
                ? "اكتشف أحدث الأنشطة والموارد والمهام المصممة لتحسين تجربة التعلّم."
                : "Explore the latest activities, resources and tasks designed to improve the learning experience."}
            </p>

            <button type="button">
              {isArabic ? "استكشف الجديد" : "Explore What’s New"}
              <DirectionArrow size={17} />
            </button>
          </article>
        </section>
      </div>
    </main>
  );
}
