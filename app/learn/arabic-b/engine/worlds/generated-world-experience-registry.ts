// AUTO-GENERATED from content/worlds JSON packages.
import type { WorldId } from "../core/types";

export type LocalizedText = { en: string; ar: string };

export type WorldExperienceRecord = {
  id: WorldId;
  title: LocalizedText;
  description: LocalizedText;
  level: string;
  icon: string;
  heroImage: string;
  badge: LocalizedText;
  xpReward: number;
  order: number;
  scenes: Array<Record<string, unknown>>;
  missions: Array<Record<string, unknown>>;
  vocabulary: Array<Record<string, unknown>>;
  characters: Array<Record<string, unknown>>;
  dialogues: Array<Record<string, unknown>>;
};

export const WORLD_EXPERIENCE_REGISTRY = [
  {
    id: "airport",
    title: {
      en: "At the Airport",
      ar: "في المطار",
    },
    description: {
      en: "",
      ar: "",
    },
    level: "A2",
    icon: "✈️",
    heroImage: "",
    badge: {
      en: "",
      ar: "",
    },
    xpReward: 340,
    order: 999,
    scenes: [
      {
        id: "airport-arrival",
        order: 1,
        title: {
          en: "Arrival",
          ar: "الوصول",
        },
        description: {
          en: "Enter the world and meet its characters.",
          ar: "ادخل العالم وتعرّف إلى شخصياته.",
        },
        missionIds: ["airport-mission-1"],
      },
      {
        id: "airport-practice",
        order: 2,
        title: {
          en: "Guided Practice",
          ar: "التدريب الموجّه",
        },
        description: {
          en: "Practise vocabulary and useful expressions.",
          ar: "تدرّب على المفردات والتعبيرات المفيدة.",
        },
        missionIds: ["airport-mission-2"],
      },
      {
        id: "airport-challenge",
        order: 3,
        title: {
          en: "World Challenge",
          ar: "تحدي العالم",
        },
        description: {
          en: "Complete a realistic communication challenge.",
          ar: "أكمل تحديًا تواصليًا واقعيًا.",
        },
        missionIds: ["airport-mission-3"],
      },
    ],
    missions: [
      {
        id: "airport-mission-1",
        order: 1,
        type: "story",
        title: {
          en: "Discover",
          ar: "اكتشف",
        },
        xp: 25,
        required: true,
      },
      {
        id: "airport-mission-2",
        order: 2,
        type: "practice",
        title: {
          en: "Practise",
          ar: "تدرّب",
        },
        xp: 35,
        required: true,
      },
      {
        id: "airport-mission-3",
        order: 3,
        type: "conversation",
        title: {
          en: "Communicate",
          ar: "تواصل",
        },
        xp: 60,
        required: true,
      },
    ],
    vocabulary: [
      {
        id: "airport-word-1",
        arabic: "مرحبًا",
        english: "Hello",
        transliteration: "marhaban",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "airport-word-2",
        arabic: "من فضلك",
        english: "Please",
        transliteration: "min fadlik",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "airport-word-3",
        arabic: "شكرًا",
        english: "Thank you",
        transliteration: "shukran",
        partOfSpeech: "expression",
        audio: null,
      },
    ],
    characters: [],
    dialogues: [
      {
        id: "airport-checkin",
        title: {
          en: "Checking in",
          ar: "إنهاء إجراءات السفر",
        },
        lines: [
          {
            speaker: "Traveller",
            arabic: "هذِهِ تَذْكِرَتي وَجَوازُ سَفَري.",
            english: "Here are my ticket and passport.",
          },
          {
            speaker: "Agent",
            arabic: "إِلى أَيْنَ تُسافِر؟",
            english: "Where are you travelling?",
          },
          {
            speaker: "Traveller",
            arabic: "أُسافِرُ إِلى الدَّوْحَة.",
            english: "I am travelling to Doha.",
          },
        ],
      },
    ],
  },
  {
    id: "canteen",
    title: {
      en: "At the Canteen",
      ar: "في المقصف",
    },
    description: {
      en: "",
      ar: "",
    },
    level: "A0",
    icon: "🥙",
    heroImage: "",
    badge: {
      en: "",
      ar: "",
    },
    xpReward: 160,
    order: 999,
    scenes: [
      {
        id: "canteen-arrival",
        order: 1,
        title: {
          en: "Arrival",
          ar: "الوصول",
        },
        description: {
          en: "Enter the world and meet its characters.",
          ar: "ادخل العالم وتعرّف إلى شخصياته.",
        },
        missionIds: ["canteen-mission-1"],
      },
      {
        id: "canteen-practice",
        order: 2,
        title: {
          en: "Guided Practice",
          ar: "التدريب الموجّه",
        },
        description: {
          en: "Practise vocabulary and useful expressions.",
          ar: "تدرّب على المفردات والتعبيرات المفيدة.",
        },
        missionIds: ["canteen-mission-2"],
      },
      {
        id: "canteen-challenge",
        order: 3,
        title: {
          en: "World Challenge",
          ar: "تحدي العالم",
        },
        description: {
          en: "Complete a realistic communication challenge.",
          ar: "أكمل تحديًا تواصليًا واقعيًا.",
        },
        missionIds: ["canteen-mission-3"],
      },
    ],
    missions: [
      {
        id: "canteen-mission-1",
        order: 1,
        type: "story",
        title: {
          en: "Discover",
          ar: "اكتشف",
        },
        xp: 25,
        required: true,
      },
      {
        id: "canteen-mission-2",
        order: 2,
        type: "practice",
        title: {
          en: "Practise",
          ar: "تدرّب",
        },
        xp: 35,
        required: true,
      },
      {
        id: "canteen-mission-3",
        order: 3,
        type: "conversation",
        title: {
          en: "Communicate",
          ar: "تواصل",
        },
        xp: 60,
        required: true,
      },
    ],
    vocabulary: [
      {
        id: "canteen-word-1",
        arabic: "مرحبًا",
        english: "Hello",
        transliteration: "marhaban",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "canteen-word-2",
        arabic: "من فضلك",
        english: "Please",
        transliteration: "min fadlik",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "canteen-word-3",
        arabic: "شكرًا",
        english: "Thank you",
        transliteration: "shukran",
        partOfSpeech: "expression",
        audio: null,
      },
    ],
    characters: [
      {
        id: "server-hassan",
        name: {
          en: "Hassan",
          ar: "حسن",
        },
        role: {
          en: "Canteen server",
          ar: "موظف المقصف",
        },
        avatar: "/images/bayan/characters/hassan.png",
        voice: "male-2",
        personality: "helpful, cheerful",
        difficulty: "A0",
      },
    ],
    dialogues: [
      {
        id: "canteen-order",
        title: {
          en: "Ordering lunch",
          ar: "طلب الغداء",
        },
        lines: [
          {
            speaker: "Student",
            arabic: "أُريدُ شَطيرَةً وَعَصيرًا، مِنْ فَضْلِكَ.",
            english: "I would like a sandwich and juice, please.",
          },
          {
            speaker: "Staff",
            arabic: "تَفَضَّل. هَلْ تُريدُ شَيْئًا آخَر؟",
            english: "Here you are. Would you like anything else?",
          },
          {
            speaker: "Student",
            arabic: "لا، شُكْرًا.",
            english: "No, thank you.",
          },
        ],
      },
    ],
  },
  {
    id: "hospital",
    title: {
      en: "At the Hospital",
      ar: "في المستشفى",
    },
    description: {
      en: "",
      ar: "",
    },
    level: "A2",
    icon: "🏥",
    heroImage: "",
    badge: {
      en: "",
      ar: "",
    },
    xpReward: 280,
    order: 999,
    scenes: [
      {
        id: "hospital-arrival",
        order: 1,
        title: {
          en: "Arrival",
          ar: "الوصول",
        },
        description: {
          en: "Enter the world and meet its characters.",
          ar: "ادخل العالم وتعرّف إلى شخصياته.",
        },
        missionIds: ["hospital-mission-1"],
      },
      {
        id: "hospital-practice",
        order: 2,
        title: {
          en: "Guided Practice",
          ar: "التدريب الموجّه",
        },
        description: {
          en: "Practise vocabulary and useful expressions.",
          ar: "تدرّب على المفردات والتعبيرات المفيدة.",
        },
        missionIds: ["hospital-mission-2"],
      },
      {
        id: "hospital-challenge",
        order: 3,
        title: {
          en: "World Challenge",
          ar: "تحدي العالم",
        },
        description: {
          en: "Complete a realistic communication challenge.",
          ar: "أكمل تحديًا تواصليًا واقعيًا.",
        },
        missionIds: ["hospital-mission-3"],
      },
    ],
    missions: [
      {
        id: "hospital-mission-1",
        order: 1,
        type: "story",
        title: {
          en: "Discover",
          ar: "اكتشف",
        },
        xp: 25,
        required: true,
      },
      {
        id: "hospital-mission-2",
        order: 2,
        type: "practice",
        title: {
          en: "Practise",
          ar: "تدرّب",
        },
        xp: 35,
        required: true,
      },
      {
        id: "hospital-mission-3",
        order: 3,
        type: "conversation",
        title: {
          en: "Communicate",
          ar: "تواصل",
        },
        xp: 60,
        required: true,
      },
    ],
    vocabulary: [
      {
        id: "hospital-word-1",
        arabic: "مرحبًا",
        english: "Hello",
        transliteration: "marhaban",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "hospital-word-2",
        arabic: "من فضلك",
        english: "Please",
        transliteration: "min fadlik",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "hospital-word-3",
        arabic: "شكرًا",
        english: "Thank you",
        transliteration: "shukran",
        partOfSpeech: "expression",
        audio: null,
      },
    ],
    characters: [],
    dialogues: [
      {
        id: "hospital-visit",
        title: {
          en: "At the doctor",
          ar: "عند الطبيب",
        },
        lines: [
          {
            speaker: "Doctor",
            arabic: "ما الَّذي يُؤْلِمُكَ؟",
            english: "What hurts?",
          },
          {
            speaker: "Patient",
            arabic: "رَأْسي يُؤْلِمُني.",
            english: "My head hurts.",
          },
          {
            speaker: "Doctor",
            arabic: "خُذْ قِسْطًا مِنَ الرّاحَة.",
            english: "Get some rest.",
          },
        ],
      },
    ],
  },
  {
    id: "library",
    title: {
      en: "In the Library",
      ar: "في المكتبة",
    },
    description: {
      en: "",
      ar: "",
    },
    level: "A1",
    icon: "📚",
    heroImage: "",
    badge: {
      en: "",
      ar: "",
    },
    xpReward: 190,
    order: 999,
    scenes: [
      {
        id: "library-arrival",
        order: 1,
        title: {
          en: "Arrival",
          ar: "الوصول",
        },
        description: {
          en: "Enter the world and meet its characters.",
          ar: "ادخل العالم وتعرّف إلى شخصياته.",
        },
        missionIds: ["library-mission-1"],
      },
      {
        id: "library-practice",
        order: 2,
        title: {
          en: "Guided Practice",
          ar: "التدريب الموجّه",
        },
        description: {
          en: "Practise vocabulary and useful expressions.",
          ar: "تدرّب على المفردات والتعبيرات المفيدة.",
        },
        missionIds: ["library-mission-2"],
      },
      {
        id: "library-challenge",
        order: 3,
        title: {
          en: "World Challenge",
          ar: "تحدي العالم",
        },
        description: {
          en: "Complete a realistic communication challenge.",
          ar: "أكمل تحديًا تواصليًا واقعيًا.",
        },
        missionIds: ["library-mission-3"],
      },
    ],
    missions: [
      {
        id: "library-mission-1",
        order: 1,
        type: "story",
        title: {
          en: "Discover",
          ar: "اكتشف",
        },
        xp: 25,
        required: true,
      },
      {
        id: "library-mission-2",
        order: 2,
        type: "practice",
        title: {
          en: "Practise",
          ar: "تدرّب",
        },
        xp: 35,
        required: true,
      },
      {
        id: "library-mission-3",
        order: 3,
        type: "conversation",
        title: {
          en: "Communicate",
          ar: "تواصل",
        },
        xp: 60,
        required: true,
      },
    ],
    vocabulary: [
      {
        id: "library-word-1",
        arabic: "مرحبًا",
        english: "Hello",
        transliteration: "marhaban",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "library-word-2",
        arabic: "من فضلك",
        english: "Please",
        transliteration: "min fadlik",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "library-word-3",
        arabic: "شكرًا",
        english: "Thank you",
        transliteration: "shukran",
        partOfSpeech: "expression",
        audio: null,
      },
    ],
    characters: [],
    dialogues: [
      {
        id: "library-book",
        title: {
          en: "Finding a book",
          ar: "البحث عن كتاب",
        },
        lines: [
          {
            speaker: "Student",
            arabic: "أَيْنَ كُتُبُ القِصَص؟",
            english: "Where are the story books?",
          },
          {
            speaker: "Librarian",
            arabic: "هِيَ عَلى الرَّفِّ الثّالِث.",
            english: "They are on the third shelf.",
          },
          {
            speaker: "Student",
            arabic: "شُكْرًا لَكِ.",
            english: "Thank you.",
          },
        ],
      },
    ],
  },
  {
    id: "market",
    title: {
      en: "At the Market",
      ar: "في السوق",
    },
    description: {
      en: "",
      ar: "",
    },
    level: "A1",
    icon: "🛍️",
    heroImage: "",
    badge: {
      en: "",
      ar: "",
    },
    xpReward: 240,
    order: 999,
    scenes: [
      {
        id: "market-arrival",
        order: 1,
        title: {
          en: "Arrival",
          ar: "الوصول",
        },
        description: {
          en: "Enter the world and meet its characters.",
          ar: "ادخل العالم وتعرّف إلى شخصياته.",
        },
        missionIds: ["market-mission-1"],
      },
      {
        id: "market-practice",
        order: 2,
        title: {
          en: "Guided Practice",
          ar: "التدريب الموجّه",
        },
        description: {
          en: "Practise vocabulary and useful expressions.",
          ar: "تدرّب على المفردات والتعبيرات المفيدة.",
        },
        missionIds: ["market-mission-2"],
      },
      {
        id: "market-challenge",
        order: 3,
        title: {
          en: "World Challenge",
          ar: "تحدي العالم",
        },
        description: {
          en: "Complete a realistic communication challenge.",
          ar: "أكمل تحديًا تواصليًا واقعيًا.",
        },
        missionIds: ["market-mission-3"],
      },
    ],
    missions: [
      {
        id: "market-mission-1",
        order: 1,
        type: "story",
        title: {
          en: "Discover",
          ar: "اكتشف",
        },
        xp: 25,
        required: true,
      },
      {
        id: "market-mission-2",
        order: 2,
        type: "practice",
        title: {
          en: "Practise",
          ar: "تدرّب",
        },
        xp: 35,
        required: true,
      },
      {
        id: "market-mission-3",
        order: 3,
        type: "conversation",
        title: {
          en: "Communicate",
          ar: "تواصل",
        },
        xp: 60,
        required: true,
      },
    ],
    vocabulary: [
      {
        id: "market-word-1",
        arabic: "مرحبًا",
        english: "Hello",
        transliteration: "marhaban",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "market-word-2",
        arabic: "من فضلك",
        english: "Please",
        transliteration: "min fadlik",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "market-word-3",
        arabic: "شكرًا",
        english: "Thank you",
        transliteration: "shukran",
        partOfSpeech: "expression",
        audio: null,
      },
    ],
    characters: [],
    dialogues: [
      {
        id: "market-shopping",
        title: {
          en: "Buying fruit",
          ar: "شراء الفاكهة",
        },
        lines: [
          {
            speaker: "Customer",
            arabic: "بِكَمْ هذِهِ التُّفّاحَة؟",
            english: "How much is this apple?",
          },
          {
            speaker: "Seller",
            arabic: "بِخَمْسَةِ رِيالات.",
            english: "It is five riyals.",
          },
          {
            speaker: "Customer",
            arabic: "سَآخُذُ اثْنَتَيْنِ، مِنْ فَضْلِكَ.",
            english: "I will take two, please.",
          },
        ],
      },
    ],
  },
  {
    id: "school",
    title: {
      en: "At School",
      ar: "في المدرسة",
    },
    description: {
      en: "",
      ar: "",
    },
    level: "A0",
    icon: "🏫",
    heroImage: "",
    badge: {
      en: "",
      ar: "",
    },
    xpReward: 120,
    order: 999,
    scenes: [
      {
        id: "school-arrival",
        order: 1,
        title: {
          en: "Arrival",
          ar: "الوصول",
        },
        description: {
          en: "Enter the world and meet its characters.",
          ar: "ادخل العالم وتعرّف إلى شخصياته.",
        },
        missionIds: ["school-mission-1"],
      },
      {
        id: "school-practice",
        order: 2,
        title: {
          en: "Guided Practice",
          ar: "التدريب الموجّه",
        },
        description: {
          en: "Practise vocabulary and useful expressions.",
          ar: "تدرّب على المفردات والتعبيرات المفيدة.",
        },
        missionIds: ["school-mission-2"],
      },
      {
        id: "school-challenge",
        order: 3,
        title: {
          en: "World Challenge",
          ar: "تحدي العالم",
        },
        description: {
          en: "Complete a realistic communication challenge.",
          ar: "أكمل تحديًا تواصليًا واقعيًا.",
        },
        missionIds: ["school-mission-3"],
      },
    ],
    missions: [
      {
        id: "school-mission-1",
        order: 1,
        type: "story",
        title: {
          en: "Discover",
          ar: "اكتشف",
        },
        xp: 25,
        required: true,
      },
      {
        id: "school-mission-2",
        order: 2,
        type: "practice",
        title: {
          en: "Practise",
          ar: "تدرّب",
        },
        xp: 35,
        required: true,
      },
      {
        id: "school-mission-3",
        order: 3,
        type: "conversation",
        title: {
          en: "Communicate",
          ar: "تواصل",
        },
        xp: 60,
        required: true,
      },
    ],
    vocabulary: [
      {
        id: "school-word-1",
        arabic: "مرحبًا",
        english: "Hello",
        transliteration: "marhaban",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "school-word-2",
        arabic: "من فضلك",
        english: "Please",
        transliteration: "min fadlik",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "school-word-3",
        arabic: "شكرًا",
        english: "Thank you",
        transliteration: "shukran",
        partOfSpeech: "expression",
        audio: null,
      },
    ],
    characters: [
      {
        id: "teacher-omar",
        name: {
          en: "Mr Omar",
          ar: "الأستاذ عمر",
        },
        role: {
          en: "Arabic teacher",
          ar: "معلم اللغة العربية",
        },
        avatar: "/images/bayan/characters/teacher-omar.png",
        voice: "male-1",
        personality: "warm, patient, encouraging",
        difficulty: "A0",
      },
      {
        id: "student-lina",
        name: {
          en: "Lina",
          ar: "لينا",
        },
        role: {
          en: "Classmate",
          ar: "زميلة",
        },
        avatar: "/images/bayan/characters/lina.png",
        voice: "female-1",
        personality: "friendly, curious",
        difficulty: "A0",
      },
    ],
    dialogues: [
      {
        id: "school-greeting",
        title: {
          en: "Meeting the teacher",
          ar: "لقاء المعلم",
        },
        lines: [
          {
            speaker: "Student",
            arabic: "السَّلامُ عَلَيْكُم.",
            english: "Peace be upon you.",
          },
          {
            speaker: "Teacher",
            arabic: "وَعَلَيْكُمُ السَّلام. أَهْلًا وَسَهْلًا.",
            english: "And peace be upon you. Welcome.",
          },
          {
            speaker: "Student",
            arabic: "شُكْرًا يا أُسْتاذ.",
            english: "Thank you, teacher.",
          },
        ],
      },
    ],
  },
  {
    id: "university",
    title: {
      en: "At University",
      ar: "في الجامعة",
    },
    description: {
      en: "",
      ar: "",
    },
    level: "B1",
    icon: "🎓",
    heroImage: "",
    badge: {
      en: "",
      ar: "",
    },
    xpReward: 500,
    order: 999,
    scenes: [
      {
        id: "university-arrival",
        order: 1,
        title: {
          en: "Arrival",
          ar: "الوصول",
        },
        description: {
          en: "Enter the world and meet its characters.",
          ar: "ادخل العالم وتعرّف إلى شخصياته.",
        },
        missionIds: ["university-mission-1"],
      },
      {
        id: "university-practice",
        order: 2,
        title: {
          en: "Guided Practice",
          ar: "التدريب الموجّه",
        },
        description: {
          en: "Practise vocabulary and useful expressions.",
          ar: "تدرّب على المفردات والتعبيرات المفيدة.",
        },
        missionIds: ["university-mission-2"],
      },
      {
        id: "university-challenge",
        order: 3,
        title: {
          en: "World Challenge",
          ar: "تحدي العالم",
        },
        description: {
          en: "Complete a realistic communication challenge.",
          ar: "أكمل تحديًا تواصليًا واقعيًا.",
        },
        missionIds: ["university-mission-3"],
      },
    ],
    missions: [
      {
        id: "university-mission-1",
        order: 1,
        type: "story",
        title: {
          en: "Discover",
          ar: "اكتشف",
        },
        xp: 25,
        required: true,
      },
      {
        id: "university-mission-2",
        order: 2,
        type: "practice",
        title: {
          en: "Practise",
          ar: "تدرّب",
        },
        xp: 35,
        required: true,
      },
      {
        id: "university-mission-3",
        order: 3,
        type: "conversation",
        title: {
          en: "Communicate",
          ar: "تواصل",
        },
        xp: 60,
        required: true,
      },
    ],
    vocabulary: [
      {
        id: "university-word-1",
        arabic: "مرحبًا",
        english: "Hello",
        transliteration: "marhaban",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "university-word-2",
        arabic: "من فضلك",
        english: "Please",
        transliteration: "min fadlik",
        partOfSpeech: "expression",
        audio: null,
      },
      {
        id: "university-word-3",
        arabic: "شكرًا",
        english: "Thank you",
        transliteration: "shukran",
        partOfSpeech: "expression",
        audio: null,
      },
    ],
    characters: [],
    dialogues: [
      {
        id: "university-introduction",
        title: {
          en: "Introducing your studies",
          ar: "التعريف بالدراسة",
        },
        lines: [
          {
            speaker: "Student A",
            arabic: "ماذا تَدْرُسُ في الجامِعَة؟",
            english: "What do you study at university?",
          },
          {
            speaker: "Student B",
            arabic: "أَدْرُسُ عِلْمَ الحاسوب.",
            english: "I study computer science.",
          },
          {
            speaker: "Student A",
            arabic: "هذا تَخَصُّصٌ مُفيد.",
            english: "That is a useful major.",
          },
        ],
      },
    ],
  },
] as WorldExperienceRecord[];

export function getWorldExperience(worldId: WorldId) {
  return WORLD_EXPERIENCE_REGISTRY.find((world) => world.id === worldId);
}
