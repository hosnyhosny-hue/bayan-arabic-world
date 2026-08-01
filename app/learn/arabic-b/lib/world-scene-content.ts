import type { JourneyWorldId } from "./journey-types";
import type { MissionScene, StageSceneExperience } from "./story-scene-types";
import { getWorldContent } from "./world-content";

type Seed = {
  ar: string;
  en: string;
  icon: string;
  situation: string;
  speaker: string;
  dialogue: string;
  target: string;
  prompt: string;
  hint: string;
  right: string;
  wrongA: string;
  wrongB: string;
};

type StageMap = Record<string, Seed>;

function scenes(seed: Seed): MissionScene[] {
  return [
    {
      id: "intro",
      kind: "intro",
      eyebrowAr: "المشهد",
      titleAr: seed.ar,
      bodyAr: seed.situation,
      speakerAr: seed.speaker,
    },
    {
      id: "listen",
      kind: "listen",
      eyebrowAr: "استمع وافهم",
      titleAr: "استمع إلى الحوار",
      bodyAr: "استمع مرة كاملة، ثم ركّز على العبارة التي تنجز الهدف.",
      speakerAr: seed.speaker,
      audioTextAr: seed.dialogue,
      modelAnswerAr: seed.dialogue,
    },
    {
      id: "choice",
      kind: "choice",
      eyebrowAr: "اختر الرد",
      titleAr: seed.prompt,
      bodyAr: "اختر الرد الأنسب للسياق.",
      choices: [
        { id: "a", labelAr: seed.right, feedbackAr: "إجابة مناسبة للموقف.", correct: true },
        { id: "b", labelAr: seed.wrongA, feedbackAr: "هذا الرد يخص موقفًا آخر.", correct: false },
        { id: "c", labelAr: seed.wrongB, feedbackAr: "هذا لا ينجز الهدف المطلوب.", correct: false },
      ],
    },
    {
      id: "speak",
      kind: "speak",
      eyebrowAr: "دورك الآن",
      titleAr: "قل ردك بصوتك",
      bodyAr: seed.prompt,
      audioTextAr: seed.target,
      modelAnswerAr: seed.target,
      promptAr: seed.prompt,
      hintAr: seed.hint,
    },
    {
      id: "result",
      kind: "result",
      eyebrowAr: "اكتملت التجربة",
      titleAr: "أحسنت — أصبحت جاهزًا للموقف",
      bodyAr: "استمعت، واخترت، وتحدثت. يمكنك إعادة التسجيل لتحسين الطلاقة.",
    },
  ];
}

const DATA: Record<JourneyWorldId, StageMap> = {
  school: {
    listen: { ar: "استمع عند بوابة المدرسة", en: "Listen at the school entrance", icon: "🎧", situation: "تسألك سارة إن كنت طالبًا جديدًا.", speaker: "سارة", dialogue: "مرحبًا! هل أنت طالب جديد؟ نعم، أنا طالب جديد في الصف السابع.", target: "نعم، أنا طالب جديد في الصف السابع.", prompt: "كيف تجيب عن سؤال سارة؟", hint: "نعم، أنا... في الصف...", right: "نعم، أنا طالب جديد.", wrongA: "أريد عصيرًا.", wrongB: "الكتاب على الطاولة." },
    discover: { ar: "اكتشف مكان الفصل", en: "Discover classroom directions", icon: "✨", situation: "دخلت المبنى ولا تعرف مكان صفك.", speaker: "المعلم", dialogue: "عفوًا، أين فصل الصف السابع؟ في الطابق الثاني بجانب المختبر.", target: "عفوًا، أين فصل الصف السابع؟", prompt: "أي سؤال يوصلك إلى الفصل؟", hint: "ابدأ بعفوًا ثم اسأل: أين...", right: "أين فصل الصف السابع؟", wrongA: "كم سعر القلم؟", wrongB: "متى تقلع الطائرة؟" },
    speak: { ar: "عرّف بنفسك أمام زميل", en: "Introduce yourself", icon: "🎙️", situation: "يسألك زميل عن اسمك وبلدك.", speaker: "آدم", dialogue: "اسمي آدم وأنا من قطر. اسمي يوسف وأنا من مصر. سعدت بلقائك.", target: "اسمي يوسف، وأنا من مصر. سعدت بلقائك.", prompt: "عرّف بنفسك في جملتين.", hint: "اسمي... وأنا من...", right: "اسمي يوسف وأنا من مصر.", wrongA: "أشعر بصداع.", wrongB: "أريد استعارة كتاب." },
    practice: { ar: "اطلب مساعدة داخل الصف", en: "Ask for help in class", icon: "🧩", situation: "لم تسمع رقم الصفحة الذي قاله المعلم.", speaker: "المعلم", dialogue: "من فضلك يا أستاذ، ما رقم الصفحة؟ افتحوا الصفحة الخامسة عشرة.", target: "من فضلك، ما رقم الصفحة؟", prompt: "ماذا تقول عندما لا تسمع رقم الصفحة؟", hint: "من فضلك + سؤال عن الرقم.", right: "ما رقم الصفحة؟", wrongA: "أين بوابة الصعود؟", wrongB: "هل يوجد مقاس أكبر؟" },
    mission: { ar: "نفّذ مهمة اليوم الأول", en: "Complete the first-day mission", icon: "🎯", situation: "قدّم نفسك ثم اسأل عن فصلك.", speaker: "موظف الاستقبال", dialogue: "صباح الخير. اسمي يوسف وأنا طالب جديد. أين فصل الصف السابع، من فضلك؟", target: "صباح الخير. اسمي يوسف وأنا طالب جديد. أين فصل الصف السابع؟", prompt: "ادمج التحية والتعريف والسؤال عن المكان.", hint: "تحية، اسم، سؤال.", right: "صباح الخير، أنا طالب جديد. أين فصلي؟", wrongA: "أريد قهوة وحلوى.", wrongB: "لدي موعد مع الطبيب." },
    assessment: { ar: "أثبت جاهزيتك في المدرسة", en: "Prove school readiness", icon: "🏆", situation: "تحدث دون تلميحات واطلب الوصول إلى فصلك.", speaker: "موظف الاستقبال", dialogue: "مرحبًا، اسمي ليان. أنا طالبة جديدة في الصف الثامن. هل تساعدني في الوصول إلى الفصل؟", target: "مرحبًا، اسمي ليان. أنا طالبة جديدة. هل تساعدني في الوصول إلى الفصل؟", prompt: "قدّم ردًا كاملًا من ثلاث جمل.", hint: "تعريف + صف + طلب مساعدة.", right: "تعريف ثم طلب مساعدة.", wrongA: "سؤال عن السعر فقط.", wrongB: "وصف عرض صحي." },
  },
  canteen: {
    listen: { ar: "اسمع طلبًا في المقهى", en: "Listen to a café order", icon: "🎧", situation: "تسمع زبونًا يطلب مشروبًا وطعامًا.", speaker: "موظف المقهى", dialogue: "أريد شايًا بالنعناع وقطعة كرواسون، من فضلك.", target: "أريد شايًا بالنعناع وقطعة كرواسون، من فضلك.", prompt: "أي طلب يطابق ما سمعته؟", hint: "لاحظ المشروب والطعام.", right: "شاي بالنعناع وكرواسون.", wrongA: "قهوة فقط.", wrongB: "عصير وبرغر." },
    discover: { ar: "اختر الحجم والإضافة", en: "Choose size and extras", icon: "✨", situation: "يسألك الموظف عن الحجم والسكر.", speaker: "موظف المقهى", dialogue: "ما الحجم؟ كبير، ومن دون سكر، من فضلك.", target: "كبير، ومن دون سكر، من فضلك.", prompt: "كيف تحدد الحجم والإضافة؟", hint: "الحجم أولًا ثم الإضافة.", right: "كبير ومن دون سكر.", wrongA: "في الطابق الثاني.", wrongB: "منذ يومين." },
    speak: { ar: "اطلب وجبتك بصوتك", en: "Say your food order", icon: "🎙️", situation: "حان دورك أمام صندوق الطلب.", speaker: "موظف المقهى", dialogue: "أريد ساندويتش جبن وعصير برتقال، من فضلك.", target: "أريد ساندويتش جبن وعصير برتقال، من فضلك.", prompt: "اطلب طعامًا ومشروبًا في جملة واحدة.", hint: "أريد... و... من فضلك.", right: "ساندويتش وعصير.", wrongA: "كتاب وقلم.", wrongB: "جواز سفر وتذكرة." },
    practice: { ar: "اسأل عن مكونات الطعام", en: "Ask about ingredients", icon: "🧩", situation: "تريد معرفة إن كان الطبق يحتوي على مكسرات.", speaker: "موظف المقهى", dialogue: "هل يحتوي هذا الطبق على مكسرات؟ لا، لكنه يحتوي على الحليب.", target: "هل يحتوي هذا الطبق على مكسرات؟", prompt: "كيف تتحقق من مكوّن مهم؟", hint: "هل يحتوي هذا الطبق على...؟", right: "هل يحتوي على مكسرات؟", wrongA: "أين المكتبة؟", wrongB: "هل الرحلة متأخرة؟" },
    mission: { ar: "أكمل الطلب والدفع", en: "Complete order and payment", icon: "🎯", situation: "اطلب وجبة واسأل عن السعر واختر الدفع بالبطاقة.", speaker: "موظف المقهى", dialogue: "أريد سلطة وعصيرًا. كم الحساب؟ خمسة وثلاثون ريالًا. سأدفع بالبطاقة.", target: "أريد سلطة وعصيرًا. كم الحساب؟ سأدفع بالبطاقة.", prompt: "ادمج الطلب والسعر وطريقة الدفع.", hint: "ثلاث جمل قصيرة.", right: "طلب + سعر + بطاقة.", wrongA: "اسم + جنسية.", wrongB: "أعراض + دواء." },
    assessment: { ar: "أثبت جاهزيتك في المقهى", en: "Prove café readiness", icon: "🏆", situation: "أنشئ طلبًا جديدًا دون نسخ النموذج.", speaker: "موظف المقهى", dialogue: "مساء الخير. أريد حساءً وخبزًا وماءً. هل يمكنني الدفع نقدًا؟", target: "مساء الخير. أريد حساءً وخبزًا وماءً. هل يمكنني الدفع نقدًا؟", prompt: "كوّن طلبًا كاملًا من اختيارك.", hint: "غيّر الطعام والمشروب وطريقة الدفع.", right: "طلب كامل جديد.", wrongA: "كلمة واحدة.", wrongB: "صمت." },
  },
  market: {
    listen: { ar: "اسمع سؤال السعر", en: "Listen to a price question", icon: "🎧", situation: "يسأل متسوق عن سعر حقيبة.", speaker: "البائع", dialogue: "بكم هذه الحقيبة؟ سعرها مئة وعشرون ريالًا.", target: "بكم هذه الحقيبة؟", prompt: "ما السؤال المناسب عن السعر؟", hint: "استخدم بكم هذه.", right: "بكم هذه الحقيبة؟", wrongA: "ما رقم الرحلة؟", wrongB: "أين غرفة الطبيب؟" },
    discover: { ar: "اطلب الكمية", en: "Ask for a quantity", icon: "✨", situation: "تريد شراء ثلاث زجاجات ماء.", speaker: "البائع", dialogue: "أريد ثلاث زجاجات ماء، من فضلك.", target: "أريد ثلاث زجاجات ماء، من فضلك.", prompt: "كيف تطلب عددًا محددًا؟", hint: "أريد + العدد + الشيء.", right: "ثلاث زجاجات ماء.", wrongA: "الطابق الثالث.", wrongB: "بعد ساعة." },
    speak: { ar: "قارن بين منتجين", en: "Compare two products", icon: "🎙️", situation: "أمامك قميصان مختلفان في السعر والجودة.", speaker: "البائع", dialogue: "هذا القميص أرخص، لكن القميص الأزرق أجود.", target: "هذا أرخص، لكن الأزرق أجود.", prompt: "قارن بين السعر والجودة.", hint: "استخدم أرخص وأجود.", right: "هذا أرخص لكن ذاك أجود.", wrongA: "أشعر بالتعب.", wrongB: "أبحث عن كتاب." },
    practice: { ar: "اطلب مقاسًا مختلفًا", en: "Ask for another size", icon: "🧩", situation: "القميص صغير وتحتاج إلى مقاس أكبر.", speaker: "البائع", dialogue: "هل يوجد مقاس أكبر من هذا؟ نعم، لدينا مقاس كبير.", target: "هل يوجد مقاس أكبر من هذا؟", prompt: "كيف تطلب مقاسًا مختلفًا؟", hint: "هل يوجد مقاس...؟", right: "هل يوجد مقاس أكبر؟", wrongA: "ما موعد المحاضرة؟", wrongB: "أريد وصفة طبية." },
    mission: { ar: "اشتر ضمن الميزانية", en: "Shop within budget", icon: "🎯", situation: "معك مئتا ريال وتريد حقيبة وقميصًا.", speaker: "البائع", dialogue: "أريد هذه الحقيبة وهذا القميص. هل المجموع أقل من مئتي ريال؟", target: "هل المجموع أقل من مئتي ريال؟", prompt: "تحقق من أن مشترياتك ضمن الميزانية.", hint: "اسأل عن المجموع.", right: "هل المجموع أقل من مئتين؟", wrongA: "هل لدي حرارة؟", wrongB: "أين بوابة السفر؟" },
    assessment: { ar: "أثبت جاهزيتك في السوق", en: "Prove market readiness", icon: "🏆", situation: "اطلب خصمًا بسيطًا بأدب.", speaker: "البائع", dialogue: "السعر مناسب، لكن هل يمكن أن تعطيني خصمًا بسيطًا؟", target: "هل يمكن أن تعطيني خصمًا بسيطًا؟", prompt: "اطلب تخفيضًا بطريقة مهذبة.", hint: "هل يمكن + طلب.", right: "هل يمكن خصم بسيط؟", wrongA: "أعطني مجانًا.", wrongB: "لا أريد شيئًا." },
  },
  library: {
    listen: { ar: "اسمع طلب البحث", en: "Listen to a search request", icon: "🎧", situation: "طالب يبحث عن كتاب في تاريخ قطر.", speaker: "أمينة المكتبة", dialogue: "أبحث عن كتاب مبسط عن تاريخ قطر.", target: "أبحث عن كتاب مبسط عن تاريخ قطر.", prompt: "ما موضوع الكتاب المطلوب؟", hint: "ركز على تاريخ قطر.", right: "تاريخ قطر.", wrongA: "الطبخ الإيطالي.", wrongB: "رحلات الطيران." },
    discover: { ar: "اطلب توصية", en: "Ask for a recommendation", icon: "✨", situation: "هناك عدة كتب ولا تعرف الأنسب لمستواك.", speaker: "أمينة المكتبة", dialogue: "أي كتاب تنصحين به للمبتدئين؟ أنصحك بهذا الكتاب المصور.", target: "أي كتاب تنصحين به للمبتدئين؟", prompt: "كيف تطلب توصية؟", hint: "أي كتاب تنصحين به لـ...؟", right: "أي كتاب تنصحين به؟", wrongA: "كم وزن الحقيبة؟", wrongB: "هل لدي موعد؟" },
    speak: { ar: "صف ما تحب قراءته", en: "Describe reading preferences", icon: "🎙️", situation: "تسألك أمينة المكتبة عن نوع الكتب المفضل.", speaker: "أمينة المكتبة", dialogue: "أفضل الروايات القصيرة والكتب العلمية المصورة.", target: "أفضل الروايات القصيرة والكتب العلمية المصورة.", prompt: "صف نوعين من الكتب التي تحبها.", hint: "أفضل... و...", right: "أفضل الروايات والعلوم.", wrongA: "أريد تذكرة سفر.", wrongB: "أشعر بألم." },
    practice: { ar: "اسأل عن مدة الاستعارة", en: "Ask about loan period", icon: "🧩", situation: "وجدت الكتاب وتريد معرفة موعد إعادته.", speaker: "أمينة المكتبة", dialogue: "كم مدة الاستعارة؟ أسبوعان من تاريخ اليوم.", target: "كم مدة الاستعارة؟", prompt: "كيف تسأل عن الزمن المسموح؟", hint: "كم مدة...؟", right: "كم مدة الاستعارة؟", wrongA: "ما حجم القهوة؟", wrongB: "كم سعر الدواء؟" },
    mission: { ar: "استعر كتاب المشروع", en: "Borrow the project book", icon: "🎯", situation: "اشرح موضوع مشروعك واطلب توصية.", speaker: "أمينة المكتبة", dialogue: "مشروعي عن البيئة في قطر. هل تنصحين بكتاب مناسب؟", target: "مشروعي عن البيئة في قطر. هل تنصحين بكتاب مناسب؟", prompt: "ادمج الموضوع وطلب التوصية.", hint: "مشروعي عن... هل تنصحين...؟", right: "موضوع + توصية.", wrongA: "سعر + خصم.", wrongB: "بوابة + رحلة." },
    assessment: { ar: "أثبت جاهزيتك في المكتبة", en: "Prove library readiness", icon: "🏆", situation: "اسأل عن كتاب ومكانه ومدة استعارته.", speaker: "أمينة المكتبة", dialogue: "أبحث عن معجم عربي مبسط. في أي قسم أجده؟ وكم مدة استعارته؟", target: "أبحث عن معجم عربي مبسط. في أي قسم أجده؟", prompt: "قدّم طلبًا كاملًا.", hint: "كتاب + مكان + مدة.", right: "كتاب ومكان ومدة.", wrongA: "طعام وسعر.", wrongB: "أعراض وعلاج." },
  },
  hospital: {
    listen: { ar: "اسمع وصف العرض", en: "Listen to a symptom", icon: "🎧", situation: "مريض يشرح أنه يعاني صداعًا.", speaker: "الطبيبة", dialogue: "أشعر بصداع شديد منذ صباح اليوم.", target: "أشعر بصداع شديد منذ صباح اليوم.", prompt: "ما العرض ومدة حدوثه؟", hint: "صداع + منذ الصباح.", right: "صداع منذ الصباح.", wrongA: "ألم قدم منذ أسبوع.", wrongB: "لا توجد أعراض." },
    discover: { ar: "حدد مكان الألم", en: "Locate the pain", icon: "✨", situation: "تسألك الطبيبة أين تشعر بالألم.", speaker: "الطبيبة", dialogue: "أشعر بألم في أسفل الظهر.", target: "أشعر بألم في أسفل الظهر.", prompt: "كيف تحدد مكان الألم؟", hint: "أشعر بألم في...", right: "في أسفل الظهر.", wrongA: "في الطابق الثاني.", wrongB: "عند البوابة الخامسة." },
    speak: { ar: "صف شدة الألم", en: "Describe pain intensity", icon: "🎙️", situation: "تريد توضيح أن الألم متوسط ويزداد ليلًا.", speaker: "الطبيبة", dialogue: "الألم متوسط، لكنه يزداد في الليل.", target: "الألم متوسط، لكنه يزداد في الليل.", prompt: "صف الشدة ومتى يزداد الألم.", hint: "الألم... لكنه يزداد...", right: "متوسط ويزداد ليلًا.", wrongA: "لذيذ وساخن.", wrongB: "غالي لكنه جيد." },
    practice: { ar: "أجب عن سؤال الحساسية", en: "Answer allergy question", icon: "🧩", situation: "تسألك الطبيبة عن الحساسية من الأدوية.", speaker: "الطبيبة", dialogue: "هل لديك حساسية من أي دواء؟ نعم، لدي حساسية من البنسلين.", target: "نعم، لدي حساسية من البنسلين.", prompt: "كيف تجيب بوضوح؟", hint: "لدي حساسية من...", right: "لدي حساسية من البنسلين.", wrongA: "أفضل الكتب العلمية.", wrongB: "أريد مقاسًا أكبر." },
    mission: { ar: "اشرح حالتك للطبيبة", en: "Explain your condition", icon: "🎯", situation: "اذكر العرض والمدة واسأل عن العلاج.", speaker: "الطبيبة", dialogue: "أشعر بألم في الحلق منذ ثلاثة أيام. هل أحتاج إلى دواء؟", target: "أشعر بألم في الحلق منذ ثلاثة أيام. هل أحتاج إلى دواء؟", prompt: "ادمج العرض والمدة والسؤال.", hint: "أشعر بـ... منذ... هل أحتاج...؟", right: "عرض + مدة + علاج.", wrongA: "كتاب + استعارة.", wrongB: "طلب + حساب." },
    assessment: { ar: "أثبت جاهزيتك في العيادة", en: "Prove clinic readiness", icon: "🏆", situation: "قدّم وصفًا جديدًا لحالة بسيطة.", speaker: "الطبيبة", dialogue: "لدي سعال وحرارة منذ يومين، وأشعر بالتعب. ماذا تنصحين؟", target: "لدي سعال وحرارة منذ يومين. ماذا تنصحين؟", prompt: "تحدث دون قراءة النموذج.", hint: "عرضان + مدة + نصيحة.", right: "وصف صحي كامل.", wrongA: "سؤال سعر.", wrongB: "تعريف بالنفس." },
  },
  airport: {
    listen: { ar: "اسمع طلب الوثائق", en: "Listen for travel documents", icon: "🎧", situation: "تطلب موظفة التسجيل الجواز والتذكرة.", speaker: "موظفة التسجيل", dialogue: "من فضلك، جواز السفر والتذكرة. تفضلي، هذه وثائقي.", target: "تفضلي، هذا جواز سفري وهذه تذكرتي.", prompt: "ماذا تقدم للموظفة؟", hint: "الجواز والتذكرة.", right: "جواز وتذكرة.", wrongA: "كتاب وبطاقة مكتبة.", wrongB: "وصفة ودواء." },
    discover: { ar: "تحقق من وزن الحقيبة", en: "Check baggage weight", icon: "✨", situation: "تريد معرفة الوزن المسموح.", speaker: "موظفة التسجيل", dialogue: "كم الوزن المسموح للحقيبة؟ ثلاثون كيلوغرامًا.", target: "كم الوزن المسموح للحقيبة؟", prompt: "كيف تسأل عن الوزن؟", hint: "كم الوزن المسموح...؟", right: "كم الوزن المسموح؟", wrongA: "كم مدة الاستعارة؟", wrongB: "كم شدة الألم؟" },
    speak: { ar: "اسأل عن بوابة الصعود", en: "Ask for the boarding gate", icon: "🎙️", situation: "لا تعرف رقم البوابة.", speaker: "موظف المعلومات", dialogue: "عفوًا، أين بوابة الصعود للرحلة إلى القاهرة؟", target: "عفوًا، أين بوابة الصعود للرحلة إلى القاهرة؟", prompt: "اسأل عن البوابة واذكر الوجهة.", hint: "أين بوابة الصعود للرحلة إلى...؟", right: "بوابة الرحلة إلى القاهرة.", wrongA: "فصل الصف السابع.", wrongB: "قسم التاريخ." },
    practice: { ar: "تعامل مع تأخير الرحلة", en: "Handle a flight delay", icon: "🧩", situation: "ظهرت رسالة تأخير وتريد الوقت الجديد.", speaker: "موظف المعلومات", dialogue: "هل تأخرت الرحلة؟ نعم، موعد الإقلاع الجديد الساعة التاسعة.", target: "ما موعد الإقلاع الجديد؟", prompt: "كيف تسأل عن الوقت الجديد؟", hint: "ما موعد... الجديد؟", right: "ما موعد الإقلاع الجديد؟", wrongA: "ما سعر القميص؟", wrongB: "ما نوع الكتاب؟" },
    mission: { ar: "أكمل إجراءات السفر", en: "Complete airport procedures", icon: "🎯", situation: "قدّم الوثائق واسأل عن الحقيبة والبوابة.", speaker: "موظفة التسجيل", dialogue: "هذه وثائقي. هل وزن الحقيبة مناسب؟ وأين بوابة الصعود؟", target: "هذه وثائقي. هل وزن الحقيبة مناسب؟ وأين بوابة الصعود؟", prompt: "ادمج ثلاث خطوات.", hint: "وثائق + حقيبة + بوابة.", right: "إجراءات سفر كاملة.", wrongA: "طلب طعام.", wrongB: "وصف أعراض." },
    assessment: { ar: "أثبت جاهزيتك في المطار", en: "Prove airport readiness", icon: "🏆", situation: "تعامل مع تغيير البوابة واطلب تأكيد الوقت.", speaker: "موظف المعلومات", dialogue: "ما رقم البوابة الجديدة؟ وهل موعد الإقلاع كما هو؟", target: "ما رقم البوابة الجديدة؟ وهل موعد الإقلاع كما هو؟", prompt: "تحدث عن تغييرين.", hint: "بوابة جديدة + وقت.", right: "بوابة ووقت.", wrongA: "سعر وخصم.", wrongB: "ألم ودواء." },
  },
  university: {
    listen: { ar: "اسمع تعريف التخصص", en: "Listen to a major introduction", icon: "🎧", situation: "طالب يشرح سبب اختيار الهندسة.", speaker: "المشرف الأكاديمي", dialogue: "اخترت الهندسة لأنني أحب حل المشكلات وتصميم الأشياء.", target: "اخترت الهندسة لأنني أحب حل المشكلات.", prompt: "ما سبب اختيار التخصص؟", hint: "حب حل المشكلات.", right: "حب حل المشكلات.", wrongA: "قرب المكتبة.", wrongB: "سعر الرسوم فقط." },
    discover: { ar: "اسأل عن متطلبات المقرر", en: "Ask about course requirements", icon: "✨", situation: "تريد معرفة إن كان هناك مشروع نهائي.", speaker: "المشرف الأكاديمي", dialogue: "هل يتطلب المقرر مشروعًا نهائيًا؟ نعم، مع عرض تقديمي.", target: "هل يتطلب المقرر مشروعًا نهائيًا؟", prompt: "كيف تسأل عن متطلب أكاديمي؟", hint: "هل يتطلب المقرر...؟", right: "هل يتطلب مشروعًا؟", wrongA: "هل يحتوي على مكسرات؟", wrongB: "هل يوجد مقاس أكبر؟" },
    speak: { ar: "اشرح هدف مشروعك", en: "Explain a project goal", icon: "🎙️", situation: "تقدم فكرة تطبيق لتنظيم الوقت.", speaker: "المشرف الأكاديمي", dialogue: "يهدف مشروعي إلى مساعدة الطلاب على تنظيم وقتهم وتحسين عادات الدراسة.", target: "يهدف مشروعي إلى مساعدة الطلاب على تنظيم وقتهم.", prompt: "اذكر الهدف والفئة المستفيدة.", hint: "يهدف مشروعي إلى...", right: "هدف وفئة.", wrongA: "سعر وكمية.", wrongB: "عرض ومدة." },
    practice: { ar: "عبّر عن رأيك مع سبب", en: "State an opinion with reason", icon: "🧩", situation: "يناقش الصف التعلم المدمج.", speaker: "زميلك", dialogue: "من وجهة نظري، التعلم المدمج أفضل لأنه يجمع المرونة والتفاعل.", target: "من وجهة نظري، التعلم المدمج أفضل لأنه يجمع المرونة والتفاعل.", prompt: "قدّم رأيًا وسببًا.", hint: "من وجهة نظري... لأنه...", right: "رأي مع سبب.", wrongA: "كلمة واحدة.", wrongB: "سؤال عن المكان." },
    mission: { ar: "قدّم فكرة المشروع", en: "Present the project idea", icon: "🎯", situation: "قدّم المشكلة والحل والنتيجة.", speaker: "لجنة المشروع", dialogue: "المشكلة هي ضعف تنظيم الوقت. نقترح تطبيقًا ذكيًا، ونتوقع أن يساعد الطلاب.", target: "المشكلة هي ضعف تنظيم الوقت. نقترح تطبيقًا ذكيًا لحلها.", prompt: "نظم حديثك: مشكلة، حل، نتيجة.", hint: "المشكلة هي... نقترح...", right: "مشكلة وحل ونتيجة.", wrongA: "تحية فقط.", wrongB: "سؤال سعر." },
    assessment: { ar: "أثبت جاهزيتك الجامعية", en: "Prove university readiness", icon: "🏆", situation: "دافع عن قابلية فكرتك للتنفيذ.", speaker: "لجنة المشروع", dialogue: "الفكرة قابلة للتنفيذ لأنها تعتمد على تقنيات متاحة ويمكن اختبارها تدريجيًا.", target: "الفكرة قابلة للتنفيذ لأنها تعتمد على تقنيات متاحة ويمكن اختبارها تدريجيًا.", prompt: "دافع عن فكرتك بدليلين.", hint: "لأنها... ويمكن...", right: "رأي مع دليلين.", wrongA: "نعم فقط.", wrongB: "لا أعرف." },
  },
};

export function getStageSceneExperience(worldId: JourneyWorldId, stageId: string): StageSceneExperience | null {
  const seed = DATA[worldId]?.[stageId];
  if (!seed) return null;

  const world = getWorldContent(worldId);
  const stage = world.stages.find((item) => item.id.split(":")[1] === stageId);

  return {
    worldId,
    stageId,
    stageTitleAr: seed.ar,
    stageTitleEn: seed.en,
    icon: seed.icon,
    xp: stage?.xp ?? 10,
    scenes: scenes(seed),
  };
}
