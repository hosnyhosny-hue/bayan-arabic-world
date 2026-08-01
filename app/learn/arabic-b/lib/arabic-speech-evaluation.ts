export function normalizeArabic(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\u0600-\u06FF0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function lexicalScore(actual: string, reference: string): number {
  const actualWords = normalizeArabic(actual).split(" ").filter(Boolean);
  const referenceWords = normalizeArabic(reference).split(" ").filter(Boolean);
  if (!referenceWords.length) return 0;

  const used = new Set<number>();
  let matched = 0;

  for (const target of referenceWords) {
    const index = actualWords.findIndex(
      (word, i) => !used.has(i) && word === target,
    );
    if (index >= 0) {
      used.add(index);
      matched += 1;
    }
  }

  const recall = matched / referenceWords.length;
  const precision = actualWords.length ? matched / actualWords.length : 0;
  if (!recall || !precision) return 0;
  return Math.round((2 * recall * precision * 100) / (recall + precision));
}

export function feedbackFromScore(score: number): string[] {
  if (score >= 88) return ["نطق واضح جدًا.", "انتقل إلى سرعة طبيعية."];
  if (score >= 72) return ["أداء جيد.", "أعد الكلمات الأقل وضوحًا."];
  if (score >= 50) return ["المعنى مفهوم.", "قسّم العبارة إلى مقاطع قصيرة."];
  return ["استمع إلى النموذج مرة أخرى.", "ابدأ بكلمتين أو ثلاث كلمات."];
}
