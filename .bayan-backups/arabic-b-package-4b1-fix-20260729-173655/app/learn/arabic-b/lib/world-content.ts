import type {
  WorldExperienceContent,
  WorldStageContent,
} from "./world-experience-types";

import type { JourneyWorldId } from "./journey-types";

type WorldSeed = Omit<WorldExperienceContent, "stages"> & {
  stageCopy: {
    listen: string;
    discover: string;
    speak: string;
    practice: string;
    mission: string;
  };
};

function createStages(
  worldId: JourneyWorldId,
  copy: WorldSeed["stageCopy"],
): WorldStageContent[] {
  return [
    {
      id: `${worldId}:listen`,
      type: "listen",
      titleAr: "استمع إلى الموقف",
      titleEn: "Listen to the scene",
      descriptionAr: copy.listen,
      descriptionEn: "Listen and understand the situation from context.",
      instructionAr: "استمع مرتين، ثم حدّد الكلمات التي فهمتها.",
      xp: 10,
      durationMinutes: 2,
      icon: "🎧",
    },
    {
      id: `${worldId}:discover`,
      type: "discover",
      titleAr: "اكتشف العبارات",
      titleEn: "Discover useful phrases",
      descriptionAr: copy.discover,
      descriptionEn: "Discover the expressions needed in this situation.",
      instructionAr: "اقرأ العبارات واربط كل عبارة بهدفها.",
      xp: 15,
      durationMinutes: 3,
      icon: "✨",
    },
    {
      id: `${worldId}:speak`,
      type: "speak",
      titleAr: "قلها بصوتك",
      titleEn: "Say it yourself",
      descriptionAr: copy.speak,
      descriptionEn: "Practise speaking clearly and confidently.",
      instructionAr: "اقرأ العبارة بصوت مرتفع ثلاث مرات.",
      xp: 20,
      durationMinutes: 3,
      icon: "🎙️",
    },
    {
      id: `${worldId}:practice`,
      type: "practice",
      titleAr: "تدرّب داخل الموقف",
      titleEn: "Practise in context",
      descriptionAr: copy.practice,
      descriptionEn: "Build the right response for the situation.",
      instructionAr: "اختر الرد المناسب، ثم كوّن ردًا من عندك.",
      xp: 25,
      durationMinutes: 4,
      icon: "🧩",
    },
    {
      id: `${worldId}:mission`,
      type: "mission",
      titleAr: "نفّذ المهمة",
      titleEn: "Complete the mission",
      descriptionAr: copy.mission,
      descriptionEn: "Use Arabic to complete the real-life mission.",
      instructionAr: "أكمل الحوار واتخذ القرار الصحيح.",
      xp: 40,
      durationMinutes: 5,
      icon: "🎯",
    },
    {
      id: `${worldId}:assessment`,
      type: "reward",
      titleAr: "أثبت جاهزيتك",
      titleEn: "Prove your readiness",
      descriptionAr: "أكمل التحدي النهائي وافتح مكافأة العالم.",
      descriptionEn: "Complete the final challenge and unlock the reward.",
      instructionAr: "استخدم ما تعلمته دون تلميحات.",
      xp: 50,
      durationMinutes: 4,
      icon: "🏆",
    },
  ];
}

const SEEDS: WorldSeed[] = [
  {
    id: "school",
    level: "A0",
    icon: "🏫",
    eyebrowAr: "العالم الأول",
    titleAr: "يومك الأول في المدرسة",
    titleEn: "Your First Day at School",
    locationAr: "مدرسة دولية في الدوحة",
    storyAr:
      "وصلت إلى مدرسة جديدة. ستقابل زميلًا ومعلمًا، وتعرّف بنفسك، ثم تطلب المساعدة للوصول إلى فصلك.",
    storyEn:
      "You arrive at a new school, introduce yourself and ask for help finding your classroom.",
    missionTitleAr: "تعرّف بنفسك وابحث عن فصلك",
    missionTitleEn: "Introduce yourself and find your class",
    missionDescriptionAr:
      "استخدم التحية، واذكر اسمك، ثم اسأل عن مكان الفصل.",
    missionDescriptionEn:
      "Use a greeting, say your name and ask where your classroom is.",
    objectiveAr: "أستطيع التحية والتعريف بنفسي وطلب مساعدة بسيطة.",
    accent: "blue",
    sceneEmoji: "🎒",
    character: {
      nameAr: "سارة",
      nameEn: "Sara",
      roleAr: "زميلتك الجديدة",
      roleEn: "Your new classmate",
      avatar: "س",
      greetingAr: "مرحبًا! أنا سارة. ما اسمك؟",
    },
    stageCopy: {
      listen: "استمع إلى لقاء قصير بين طالبين في أول يوم دراسي.",
      discover: "اكتشف عبارات التحية والاسم والسؤال عن المكان.",
      speak: "تدرّب على قول اسمك وجنسيتك وصفك.",
      practice: "رتّب جمل التعارف واختر السؤال المناسب.",
      mission: "تحدث مع سارة ثم اسأل المعلم عن رقم الفصل.",
    },
    phrases: [
      {
        arabic: "مرحبًا، أنا...",
        transliteration: "Marhaban, ana...",
        english: "Hello, I am...",
        useAr: "للتعريف بنفسك.",
      },
      {
        arabic: "ما اسمك؟",
        transliteration: "Ma ismuka?",
        english: "What is your name?",
        useAr: "للسؤال عن الاسم.",
      },
      {
        arabic: "أين فصلي؟",
        transliteration: "Ayna fasli?",
        english: "Where is my classroom?",
        useAr: "لطلب الاتجاه.",
      },
    ],
    successChecklist: [
      "حيّيت زميلك بطريقة مناسبة.",
      "ذكرت اسمك بوضوح.",
      "سألت عن مكان الفصل.",
    ],
    badgeAr: "بداية واثقة",
    badgeEn: "Confident Starter",
    rewardXp: 150,
  },
  {
    id: "canteen",
    level: "A1",
    icon: "☕",
    eyebrowAr: "رحلة الطعام",
    titleAr: "استراحة في المقهى",
    titleEn: "A Café Break",
    locationAr: "مقهى عصري في الدوحة",
    storyAr:
      "دخلت المقهى في وقت الاستراحة. سيطلب منك الموظف اختيار مشروب وطعام، ثم تحديد الحجم وطريقة الدفع.",
    storyEn:
      "You enter a café, choose food and a drink, customise the order and pay.",
    missionTitleAr: "اطلب فطورك باللغة العربية",
    missionTitleEn: "Order your breakfast in Arabic",
    missionDescriptionAr:
      "اطلب مشروبًا وطعامًا، واسأل عن السعر، ثم اشكر الموظف.",
    missionDescriptionEn:
      "Order a drink and food, ask the price and thank the server.",
    objectiveAr: "أستطيع طلب الطعام والشراب والسؤال عن السعر.",
    accent: "orange",
    sceneEmoji: "🥐",
    character: {
      nameAr: "عمر",
      nameEn: "Omar",
      roleAr: "موظف المقهى",
      roleEn: "Café server",
      avatar: "ع",
      greetingAr: "أهلًا بك! ماذا تريد أن تطلب؟",
    },
    stageCopy: {
      listen: "استمع إلى عميل يطلب مشروبًا ووجبة خفيفة.",
      discover: "اكتشف كلمات الطلب والحجم والسعر والدفع.",
      speak: "تدرّب على استخدام «أريد» و«من فضلك».",
      practice: "كوّن طلبًا كاملًا وعدّل الحجم أو الإضافة.",
      mission: "اطلب فطورًا مناسبًا وادفع بالطريقة الصحيحة.",
    },
    phrases: [
      {
        arabic: "أريد قهوة، من فضلك.",
        transliteration: "Ureedu qahwatan, min fadlik.",
        english: "I would like a coffee, please.",
        useAr: "لطلب مشروب بأدب.",
      },
      {
        arabic: "كم السعر؟",
        transliteration: "Kam as-si'r?",
        english: "How much is it?",
        useAr: "للسؤال عن السعر.",
      },
      {
        arabic: "الحساب، من فضلك.",
        transliteration: "Al-hisaab, min fadlik.",
        english: "The bill, please.",
        useAr: "لطلب الحساب.",
      },
    ],
    successChecklist: [
      "طلبت مشروبًا وطعامًا.",
      "سألت عن السعر.",
      "استخدمت من فضلك وشكرًا.",
    ],
    badgeAr: "متحدث المقهى",
    badgeEn: "Café Speaker",
    rewardXp: 150,
  },
  {
    id: "market",
    level: "A1",
    icon: "🛍️",
    eyebrowAr: "رحلة التسوق",
    titleAr: "جولة في السوق",
    titleEn: "A Trip to the Market",
    locationAr: "سوق شعبي نابض بالحياة",
    storyAr:
      "لديك قائمة قصيرة من الاحتياجات. ستسأل عن السعر والكمية، وتقارن بين خيارين، ثم تكمل عملية الشراء.",
    storyEn:
      "You have a shopping list, ask about prices and quantities, compare options and buy what you need.",
    missionTitleAr: "اشترِ احتياجاتك ضمن الميزانية",
    missionTitleEn: "Buy what you need within budget",
    missionDescriptionAr:
      "اعثر على ثلاثة أشياء، واسأل عن الأسعار، واختر الأنسب.",
    missionDescriptionEn:
      "Find three items, ask their prices and choose the best option.",
    objectiveAr: "أستطيع السؤال عن السعر والكمية واتخاذ قرار شراء.",
    accent: "emerald",
    sceneEmoji: "🧺",
    character: {
      nameAr: "أبو خالد",
      nameEn: "Abu Khalid",
      roleAr: "البائع",
      roleEn: "Shopkeeper",
      avatar: "خ",
      greetingAr: "تفضل! ماذا تحتاج اليوم؟",
    },
    stageCopy: {
      listen: "استمع إلى حوار بين بائع ومتسوق.",
      discover: "اكتشف الأرقام والكمية وعبارات المقارنة.",
      speak: "تدرّب على السؤال عن السعر والعدد.",
      practice: "قارن بين منتجين واختر الأنسب.",
      mission: "أكمل قائمة الشراء دون تجاوز الميزانية.",
    },
    phrases: [
      {
        arabic: "بكم هذا؟",
        transliteration: "Bikam hatha?",
        english: "How much is this?",
        useAr: "للسؤال عن سعر شيء قريب.",
      },
      {
        arabic: "أريد اثنين.",
        transliteration: "Ureedu ithnayn.",
        english: "I want two.",
        useAr: "لطلب كمية.",
      },
      {
        arabic: "هل يوجد أرخص؟",
        transliteration: "Hal yujad arkhas?",
        english: "Is there a cheaper one?",
        useAr: "للمقارنة بين الأسعار.",
      },
    ],
    successChecklist: [
      "سألت عن سعر ثلاثة أشياء.",
      "حددت الكمية.",
      "اخترت ضمن الميزانية.",
    ],
    badgeAr: "متسوق ذكي",
    badgeEn: "Smart Shopper",
    rewardXp: 170,
  },
  {
    id: "library",
    level: "A2",
    icon: "📚",
    eyebrowAr: "رحلة المعرفة",
    titleAr: "مهمة في المكتبة",
    titleEn: "A Library Mission",
    locationAr: "مكتبة المدرسة",
    storyAr:
      "تحتاج إلى كتاب لمشروعك. ستشرح موضوعك، وتطلب توصية، ثم تستعير الكتاب المناسب.",
    storyEn:
      "You need a book for a project, explain the topic, ask for a recommendation and borrow it.",
    missionTitleAr: "اعثر على الكتاب المناسب",
    missionTitleEn: "Find the right book",
    missionDescriptionAr:
      "صف الكتاب الذي تبحث عنه، واطلب توصية، ثم أكمل الاستعارة.",
    missionDescriptionEn:
      "Describe the book you need, ask for a recommendation and borrow it.",
    objectiveAr: "أستطيع وصف اهتماماتي وطلب توصية عن كتاب.",
    accent: "violet",
    sceneEmoji: "🔖",
    character: {
      nameAr: "ليلى",
      nameEn: "Layla",
      roleAr: "أمينة المكتبة",
      roleEn: "Librarian",
      avatar: "ل",
      greetingAr: "مرحبًا، ما نوع الكتاب الذي تبحث عنه؟",
    },
    stageCopy: {
      listen: "استمع إلى طالب يطلب مساعدة في اختيار كتاب.",
      discover: "اكتشف عبارات الموضوع والتفضيل والاستعارة.",
      speak: "صف نوع الكتب التي تفضلها.",
      practice: "اربط أوصاف الكتب بالأقسام المناسبة.",
      mission: "اطلب توصية واستعر كتابًا لمشروعك.",
    },
    phrases: [
      {
        arabic: "أبحث عن كتاب عن...",
        transliteration: "Abhathu an kitaabin an...",
        english: "I am looking for a book about...",
        useAr: "لوصف موضوع الكتاب.",
      },
      {
        arabic: "ماذا تنصحين؟",
        transliteration: "Matha tansahina?",
        english: "What do you recommend?",
        useAr: "لطلب توصية.",
      },
      {
        arabic: "أريد استعارة هذا الكتاب.",
        transliteration: "Ureedu isti'arata hatha al-kitaab.",
        english: "I want to borrow this book.",
        useAr: "لإتمام الاستعارة.",
      },
    ],
    successChecklist: [
      "وصفت موضوع الكتاب.",
      "طلبت توصية.",
      "أكملت الاستعارة.",
    ],
    badgeAr: "مستكشف المعرفة",
    badgeEn: "Knowledge Explorer",
    rewardXp: 190,
  },
  {
    id: "hospital",
    level: "A2",
    icon: "🏥",
    eyebrowAr: "رحلة العافية",
    titleAr: "زيارة إلى العيادة",
    titleEn: "A Visit to the Clinic",
    locationAr: "مركز صحي في الدوحة",
    storyAr:
      "لا تشعر أنك بخير. ستشرح الأعراض للطبيبة، وتجيب عن أسئلتها، ثم تفهم التعليمات الأساسية.",
    storyEn:
      "You feel unwell, describe your symptoms, answer the doctor and understand basic instructions.",
    missionTitleAr: "صف ما تشعر به",
    missionTitleEn: "Describe how you feel",
    missionDescriptionAr:
      "اذكر الأعراض والمدة، ثم افهم نصيحة الطبيبة.",
    missionDescriptionEn:
      "Explain your symptoms and how long you have had them, then understand the advice.",
    objectiveAr: "أستطيع وصف أعراض بسيطة وفهم تعليمات صحية أساسية.",
    accent: "red",
    sceneEmoji: "🩺",
    character: {
      nameAr: "الدكتورة مريم",
      nameEn: "Dr Maryam",
      roleAr: "الطبيبة",
      roleEn: "Doctor",
      avatar: "م",
      greetingAr: "السلام عليكم، ما المشكلة؟",
    },
    stageCopy: {
      listen: "استمع إلى مريض يصف أعراضًا بسيطة.",
      discover: "اكتشف كلمات الألم والحرارة والمدة.",
      speak: "تدرّب على وصف موضع الألم وشدته.",
      practice: "اختر الإجابة المناسبة لأسئلة الطبيبة.",
      mission: "اشرح الأعراض وافهم التعليمات النهائية.",
    },
    phrases: [
      {
        arabic: "أشعر بألم في...",
        transliteration: "Ash'uru bi-alamin fi...",
        english: "I feel pain in...",
        useAr: "لوصف موضع الألم.",
      },
      {
        arabic: "منذ يومين.",
        transliteration: "Mundhu yawmayn.",
        english: "For two days.",
        useAr: "لتحديد مدة الأعراض.",
      },
      {
        arabic: "هل أحتاج إلى دواء؟",
        transliteration: "Hal ahtaju ila dawaa?",
        english: "Do I need medicine?",
        useAr: "للسؤال عن العلاج.",
      },
    ],
    successChecklist: [
      "وصفت العرض بوضوح.",
      "ذكرت مدة المشكلة.",
      "فهمت التعليمات الأساسية.",
    ],
    badgeAr: "متحدث العافية",
    badgeEn: "Wellbeing Communicator",
    rewardXp: 200,
  },
  {
    id: "airport",
    level: "B1",
    icon: "✈️",
    eyebrowAr: "رحلة السفر",
    titleAr: "من بوابة المطار",
    titleEn: "Through the Airport",
    locationAr: "مطار حمد الدولي",
    storyAr:
      "لديك رحلة دولية. ستسجل الوصول، وتسأل عن الأمتعة والبوابة، ثم تتعامل مع تغيير بسيط في الموعد.",
    storyEn:
      "You have an international flight, check in, ask about luggage and the gate, then handle a schedule change.",
    missionTitleAr: "أكمل إجراءات رحلتك",
    missionTitleEn: "Complete your travel procedures",
    missionDescriptionAr:
      "سجّل الوصول، وتحقق من الأمتعة، واعثر على بوابة الصعود.",
    missionDescriptionEn:
      "Check in, confirm your luggage and find the boarding gate.",
    objectiveAr: "أستطيع التعامل مع إجراءات السفر والسؤال عن التغييرات.",
    accent: "sky",
    sceneEmoji: "🛫",
    character: {
      nameAr: "نورا",
      nameEn: "Noura",
      roleAr: "موظفة تسجيل الوصول",
      roleEn: "Check-in agent",
      avatar: "ن",
      greetingAr: "مرحبًا، هل يمكنني رؤية جواز السفر والتذكرة؟",
    },
    stageCopy: {
      listen: "استمع إلى مسافر يكمل إجراءات تسجيل الوصول.",
      discover: "اكتشف عبارات الجواز والأمتعة والبوابة والتأخير.",
      speak: "تدرّب على طرح أسئلة واضحة عن الرحلة.",
      practice: "تعامل مع تغيير في البوابة أو وقت الإقلاع.",
      mission: "أكمل الإجراءات واعثر على بوابة الصعود.",
    },
    phrases: [
      {
        arabic: "هذه تذكرتي وجواز سفري.",
        transliteration: "Hathihi tathkirati wa jawazu safari.",
        english: "Here are my ticket and passport.",
        useAr: "عند تسجيل الوصول.",
      },
      {
        arabic: "أين بوابة الصعود؟",
        transliteration: "Ayna bawwabatu as-su'ood?",
        english: "Where is the boarding gate?",
        useAr: "للسؤال عن البوابة.",
      },
      {
        arabic: "هل تأخرت الرحلة؟",
        transliteration: "Hal ta'akhkharat ar-rihla?",
        english: "Has the flight been delayed?",
        useAr: "للسؤال عن التأخير.",
      },
    ],
    successChecklist: [
      "قدمت وثائق السفر.",
      "سألت عن الأمتعة والبوابة.",
      "تعاملت مع تغيير الموعد.",
    ],
    badgeAr: "مسافر واثق",
    badgeEn: "Confident Traveller",
    rewardXp: 230,
  },
  {
    id: "university",
    level: "B2",
    icon: "🎓",
    eyebrowAr: "رحلة المستقبل",
    titleAr: "حياة الجامعة",
    titleEn: "University Life",
    locationAr: "جامعة دولية",
    storyAr:
      "تبدأ برنامجًا جامعيًا جديدًا. ستناقش تخصصك، وتطلب معلومات عن مقرر، ثم تعرض فكرة مشروع أمام زملائك.",
    storyEn:
      "You begin a university programme, discuss your major, ask about a course and present a project idea.",
    missionTitleAr: "قدّم فكرة مشروعك",
    missionTitleEn: "Present your project idea",
    missionDescriptionAr:
      "اشرح الفكرة والهدف والخطوات، ثم أجب عن سؤالين.",
    missionDescriptionEn:
      "Explain the idea, goal and steps, then answer two questions.",
    objectiveAr: "أستطيع شرح الأفكار والخطط والدفاع عن رأيي.",
    accent: "navy",
    sceneEmoji: "💡",
    character: {
      nameAr: "الأستاذ يوسف",
      nameEn: "Mr Yusuf",
      roleAr: "المشرف الأكاديمي",
      roleEn: "Academic adviser",
      avatar: "ي",
      greetingAr: "أهلًا بك، حدثني عن تخصصك وخطتك لهذا الفصل.",
    },
    stageCopy: {
      listen: "استمع إلى طالب يناقش تخصصه وخطته الدراسية.",
      discover: "اكتشف عبارات الرأي والهدف والخطة والنتيجة.",
      speak: "تدرّب على شرح فكرة والدفاع عنها.",
      practice: "نظّم عرضًا قصيرًا من مقدمة وأسباب ونتيجة.",
      mission: "قدّم مشروعك وأجب عن أسئلة الزملاء.",
    },
    phrases: [
      {
        arabic: "اخترت هذا التخصص لأن...",
        transliteration: "Ikhtartu hatha at-takhassus li-anna...",
        english: "I chose this major because...",
        useAr: "لشرح سبب الاختيار.",
      },
      {
        arabic: "تهدف الفكرة إلى...",
        transliteration: "Tahdifu al-fikratu ila...",
        english: "The idea aims to...",
        useAr: "لتوضيح الهدف.",
      },
      {
        arabic: "من وجهة نظري...",
        transliteration: "Min wijhati nazari...",
        english: "From my point of view...",
        useAr: "لعرض الرأي.",
      },
    ],
    successChecklist: [
      "شرحت الفكرة والهدف.",
      "نظمت حديثك بوضوح.",
      "أجبت عن الأسئلة بثقة.",
    ],
    badgeAr: "صانع الأفكار",
    badgeEn: "Idea Builder",
    rewardXp: 260,
  },
];

export const WORLD_CONTENT: Record<
  JourneyWorldId,
  WorldExperienceContent
> = Object.fromEntries(
  SEEDS.map((seed) => [
    seed.id,
    {
      ...seed,
      stages: createStages(seed.id, seed.stageCopy),
    },
  ]),
) as Record<JourneyWorldId, WorldExperienceContent>;

export const WORLD_IDS = Object.keys(
  WORLD_CONTENT,
) as JourneyWorldId[];

export function isWorldId(value: string): value is JourneyWorldId {
  return value in WORLD_CONTENT;
}

export function getWorldContent(
  worldId: JourneyWorldId,
): WorldExperienceContent {
  return WORLD_CONTENT[worldId];
}
