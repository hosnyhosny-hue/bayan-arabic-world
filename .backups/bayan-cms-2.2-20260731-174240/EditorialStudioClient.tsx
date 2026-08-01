"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./editorial-studio.module.css";

type EditorialItem = {
  id: string;
  type: "hero" | "ticker";
  slot?: string;
  titleAr?: string;
  descriptionAr?: string;
  greetingAr?: string;
  label?: string;
  mediaUrl?: string;
  primaryButtonTextAr?: string;
  primaryButtonUrl?: string;
  secondaryButtonTextAr?: string;
  secondaryButtonUrl?: string;
  tickerTextAr?: string;
  order?: number;
  status?: string;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

type MediaItem = {
  id: string;
  name?: string;
  originalName?: string;
  alt?: string;
  url: string;
  contentType?: string;
  size?: number;
  createdAt?: string;
};

type HeroForm = {
  id: string;
  slot: string;
  greetingAr: string;
  label: string;
  titleAr: string;
  descriptionAr: string;
  mediaUrl: string;
  primaryButtonTextAr: string;
  primaryButtonUrl: string;
  secondaryButtonTextAr: string;
  secondaryButtonUrl: string;
  status: string;
  active: boolean;
  order: number;
  startsAt: string;
  endsAt: string;
};

type TickerForm = {
  id: string;
  tickerTextAr: string;
  order: number;
  status: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

type VisualStatus = {
  key:
    | "draft"
    | "scheduled"
    | "live"
    | "expired"
    | "disabled";
  label: string;
  description: string;
};

const emptyHero: HeroForm = {
  id: "",
  slot: "morning",
  greetingAr: "صباح الخير من بيان",
  label: "MORNING EDITION",
  titleAr: "",
  descriptionAr: "",
  mediaUrl: "",
  primaryButtonTextAr: "اقرأ إصدار اليوم",
  primaryButtonUrl: "/pulse#today",
  secondaryButtonTextAr: "دخول العائلة",
  secondaryButtonUrl: "/login",
  status: "draft",
  active: true,
  order: 0,
  startsAt: "",
  endsAt: "",
};

const emptyTicker: TickerForm = {
  id: "",
  tickerTextAr: "",
  order: 10,
  status: "published",
  active: true,
  startsAt: "",
  endsAt: "",
};

function dateTimeInput(value?: string | null): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

function apiDate(value: string): string | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

function visualStatus(item: {
  status?: string;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}): VisualStatus {
  if (item.active === false) {
    return {
      key: "disabled",
      label: "معطّل",
      description: "لن يظهر حتى تتم إعادة تفعيله.",
    };
  }

  if (item.status !== "published") {
    return {
      key: "draft",
      label: "مسودة",
      description: "محفوظ داخل الاستوديو ولم يُنشر بعد.",
    };
  }

  const now = Date.now();
  const start = item.startsAt
    ? new Date(item.startsAt).getTime()
    : null;

  const end = item.endsAt
    ? new Date(item.endsAt).getTime()
    : null;

  if (start && !Number.isNaN(start) && start > now) {
    return {
      key: "scheduled",
      label: "مجدول",
      description: `سيبدأ العرض ${new Intl.DateTimeFormat(
        "ar-QA",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      ).format(start)}.`,
    };
  }

  if (end && !Number.isNaN(end) && end < now) {
    return {
      key: "expired",
      label: "منتهي",
      description: "انتهت مدة عرض هذا المحتوى.",
    };
  }

  return {
    key: "live",
    label: "نشط الآن",
    description: "هذا المحتوى متاح للظهور على BAYAN Pulse.",
  };
}

function formatBytes(size?: number): string {
  if (!size) return "";

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function EditorialStudioClient() {
  const [items, setItems] = useState<EditorialItem[]>([]);
  const [hero, setHero] = useState<HeroForm>(emptyHero);
  const [ticker, setTicker] =
    useState<TickerForm>(emptyTicker);

  const [mediaItems, setMediaItems] =
    useState<MediaItem[]>([]);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaLoading, setMediaLoading] =
    useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(
    null
  );

  const heroes = useMemo(
    () =>
      items.filter((item) => item.type === "hero"),
    [items]
  );

  const tickers = useMemo(
    () =>
      items
        .filter((item) => item.type === "ticker")
        .sort(
          (a, b) =>
            Number(a.order || 0) -
            Number(b.order || 0)
        ),
    [items]
  );

  const activeTickerTexts = useMemo(
    () =>
      tickers
        .filter(
          (item) =>
            visualStatus(item).key === "live"
        )
        .map(
          (item) =>
            item.tickerTextAr ||
            item.titleAr ||
            ""
        )
        .filter(Boolean),
    [tickers]
  );

  const currentHeroStatus = useMemo(
    () =>
      visualStatus({
        status: hero.status,
        active: hero.active,
        startsAt: hero.startsAt
          ? apiDate(hero.startsAt)
          : null,
        endsAt: hero.endsAt
          ? apiDate(hero.endsAt)
          : null,
      }),
    [hero]
  );

  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/cms/editorial",
        { cache: "no-store" }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "تعذر تحميل المحتوى."
        );
      }

      setItems(
        Array.isArray(payload.items)
          ? payload.items
          : []
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر تحميل المحتوى."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMedia = useCallback(
    async (search = "") => {
      setMediaLoading(true);

      try {
        const query = new URLSearchParams();

        if (search.trim()) {
          query.set("search", search.trim());
        }

        const response = await fetch(
          `/api/admin/cms/editorial/media?${query.toString()}`,
          { cache: "no-store" }
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload?.error ||
              "تعذر تحميل مكتبة الوسائط."
          );
        }

        setMediaItems(
          Array.isArray(payload.items)
            ? payload.items
            : []
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "تعذر تحميل مكتبة الوسائط."
        );
      } finally {
        setMediaLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!mediaOpen) return;

    const timer = window.setTimeout(() => {
      void loadMedia(mediaSearch);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [mediaOpen, mediaSearch, loadMedia]);

  async function savePayload(
    payload: Record<string, unknown>,
    options?: {
      silent?: boolean;
    }
  ) {
    if (!options?.silent) {
      setSaving(true);
      setMessage("");
    }

    try {
      const response = await fetch(
        "/api/admin/cms/editorial",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "تعذر الحفظ."
        );
      }

      if (!options?.silent) {
        setMessage("تم حفظ المحتوى بنجاح.");
      }

      await loadItems();
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر الحفظ."
      );

      return false;
    } finally {
      if (!options?.silent) {
        setSaving(false);
      }
    }
  }

  async function submitHero(event: FormEvent) {
    event.preventDefault();

    const saved = await savePayload({
      ...hero,
      type: "hero",
      startsAt: apiDate(hero.startsAt),
      endsAt: apiDate(hero.endsAt),
    });

    if (saved && !hero.id) {
      setHero(emptyHero);
    }
  }

  async function submitTicker(event: FormEvent) {
    event.preventDefault();

    const saved = await savePayload({
      ...ticker,
      type: "ticker",
      startsAt: apiDate(ticker.startsAt),
      endsAt: apiDate(ticker.endsAt),
    });

    if (saved) {
      setTicker({
        ...emptyTicker,
        order:
          Math.max(
            0,
            ...tickers.map((item) =>
              Number(item.order || 0)
            )
          ) + 10,
      });
    }
  }

  async function uploadMedia(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "alt",
        hero.titleAr || file.name
      );

      const response = await fetch(
        "/api/admin/cms/editorial/media",
        {
          method: "POST",
          body: formData,
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error || "تعذر رفع الصورة."
        );
      }

      const uploaded = payload.item as MediaItem;

      setHero((current) => ({
        ...current,
        mediaUrl: uploaded.url,
      }));

      setMediaItems((current) => [
        uploaded,
        ...current.filter(
          (item) => item.id !== uploaded.id
        ),
      ]);

      setMessage(
        "تم رفع الصورة واختيارها للخبر الرئيسي."
      );
      setMediaOpen(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر رفع الصورة."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function deleteItem(id: string) {
    if (
      !window.confirm(
        "هل تريد حذف هذا المحتوى نهائيًا؟"
      )
    ) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/cms/editorial?id=${encodeURIComponent(
          id
        )}`,
        { method: "DELETE" }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error || "تعذر الحذف."
        );
      }

      setMessage("تم حذف المحتوى.");
      await loadItems();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر الحذف."
      );
    } finally {
      setSaving(false);
    }
  }

  async function moveTicker(
    item: EditorialItem,
    direction: "up" | "down"
  ) {
    const index = tickers.findIndex(
      (entry) => entry.id === item.id
    );

    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      index < 0 ||
      targetIndex < 0 ||
      targetIndex >= tickers.length
    ) {
      return;
    }

    const target = tickers[targetIndex];
    const currentOrder = Number(item.order || 0);
    const targetOrder = Number(target.order || 0);

    setItems((current) =>
      current.map((entry) => {
        if (entry.id === item.id) {
          return { ...entry, order: targetOrder };
        }

        if (entry.id === target.id) {
          return { ...entry, order: currentOrder };
        }

        return entry;
      })
    );

    const firstSaved = await savePayload(
      {
        ...item,
        type: "ticker",
        order: targetOrder,
      },
      { silent: true }
    );

    const secondSaved = await savePayload(
      {
        ...target,
        type: "ticker",
        order: currentOrder,
      },
      { silent: true }
    );

    setMessage(
      firstSaved && secondSaved
        ? "تم تحديث ترتيب شريط الأخبار."
        : "تعذر تحديث الترتيب بالكامل."
    );
  }

  function editHero(item: EditorialItem) {
    setHero({
      id: item.id,
      slot: item.slot || "all",
      greetingAr: item.greetingAr || "",
      label: item.label || "",
      titleAr: item.titleAr || "",
      descriptionAr:
        item.descriptionAr || "",
      mediaUrl: item.mediaUrl || "",
      primaryButtonTextAr:
        item.primaryButtonTextAr ||
        "اقرأ إصدار اليوم",
      primaryButtonUrl:
        item.primaryButtonUrl ||
        "/pulse#today",
      secondaryButtonTextAr:
        item.secondaryButtonTextAr ||
        "دخول العائلة",
      secondaryButtonUrl:
        item.secondaryButtonUrl ||
        "/login",
      status: item.status || "draft",
      active: item.active !== false,
      order: Number(item.order || 0),
      startsAt: dateTimeInput(item.startsAt),
      endsAt: dateTimeInput(item.endsAt),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function editTicker(item: EditorialItem) {
    setTicker({
      id: item.id,
      tickerTextAr:
        item.tickerTextAr ||
        item.titleAr ||
        "",
      order: Number(item.order || 0),
      status: item.status || "published",
      active: item.active !== false,
      startsAt: dateTimeInput(item.startsAt),
      endsAt: dateTimeInput(item.endsAt),
    });
  }

  return (
    <main className={styles.page} dir="rtl">
      <header className={styles.heroHeader}>
        <div>
          <span>BAYAN CMS 2.1 · LIVE COMPOSER</span>
          <h1>الاستوديو التحريري الحي</h1>
          <p>
            اكتب، شاهد النتيجة، ارفع الصورة،
            وجدول النشر من مساحة واحدة.
          </p>
        </div>

        <a
          href="/pulse"
          target="_blank"
          rel="noreferrer"
          className={styles.previewButton}
        >
          معاينة BAYAN Pulse
        </a>
      </header>

      {message ? (
        <div className={styles.message}>
          {message}
        </div>
      ) : null}

      <section className={styles.stats}>
        <article>
          <strong>{heroes.length}</strong>
          <span>أخبار رئيسية</span>
        </article>

        <article>
          <strong>{tickers.length}</strong>
          <span>عناصر الشريط</span>
        </article>

        <article>
          <strong>
            {
              items.filter(
                (item) =>
                  visualStatus(item).key ===
                  "live"
              ).length
            }
          </strong>
          <span>نشط الآن</span>
        </article>

        <article>
          <strong>
            {
              items.filter(
                (item) =>
                  visualStatus(item).key ===
                  "scheduled"
              ).length
            }
          </strong>
          <span>مجدول</span>
        </article>
      </section>

      <section className={styles.composer}>
        <div className={styles.editorPanel}>
          <header className={styles.panelHead}>
            <div>
              <span>HERO EDITOR</span>
              <h2>محرر الخبر الرئيسي</h2>
            </div>

            <div
              className={`${styles.statusBadge} ${
                styles[
                  `status_${currentHeroStatus.key}`
                ]
              }`}
            >
              {currentHeroStatus.label}
            </div>
          </header>

          <p className={styles.statusDescription}>
            {currentHeroStatus.description}
          </p>

          <form
            onSubmit={submitHero}
            className={styles.form}
          >
            <div className={styles.twoColumns}>
              <label>
                الفترة
                <select
                  value={hero.slot}
                  onChange={(event) =>
                    setHero((current) => ({
                      ...current,
                      slot: event.target.value,
                    }))
                  }
                >
                  <option value="morning">
                    الصباح
                  </option>
                  <option value="day">
                    منتصف اليوم
                  </option>
                  <option value="evening">
                    المساء
                  </option>
                  <option value="night">
                    الليل
                  </option>
                  <option value="all">
                    طوال اليوم
                  </option>
                </select>
              </label>

              <label>
                حالة النشر
                <select
                  value={hero.status}
                  onChange={(event) =>
                    setHero((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="draft">
                    مسودة
                  </option>
                  <option value="published">
                    منشور
                  </option>
                </select>
              </label>
            </div>

            <label>
              التحية
              <input
                value={hero.greetingAr}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    greetingAr:
                      event.target.value,
                  }))
                }
              />
            </label>

            <label>
              الوسم الإنجليزي
              <input
                value={hero.label}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
                dir="ltr"
              />
            </label>

            <label>
              العنوان الرئيسي
              <textarea
                value={hero.titleAr}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    titleAr: event.target.value,
                  }))
                }
                rows={3}
                required
              />
            </label>

            <label>
              الوصف
              <textarea
                value={hero.descriptionAr}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    descriptionAr:
                      event.target.value,
                  }))
                }
                rows={3}
              />
            </label>

            <div className={styles.mediaField}>
              <div>
                <strong>صورة الخبر الرئيسي</strong>
                <small>
                  ارفع صورة جديدة أو اختر من مكتبة
                  الوسائط.
                </small>
              </div>

              <div className={styles.mediaActions}>
                <button
                  type="button"
                  onClick={() => {
                    setMediaOpen(true);
                    void loadMedia();
                  }}
                >
                  مكتبة الوسائط
                </button>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploading}
                  className={styles.uploadButton}
                >
                  {uploading
                    ? "جارٍ الرفع..."
                    : "رفع صورة"}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  hidden
                  onChange={uploadMedia}
                />
              </div>
            </div>

            <label>
              رابط الصورة
              <input
                value={hero.mediaUrl}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    mediaUrl: event.target.value,
                  }))
                }
                dir="ltr"
                placeholder="يُملأ تلقائيًا بعد اختيار الصورة"
              />
            </label>

            <div className={styles.twoColumns}>
              <label>
                نص الزر الرئيسي
                <input
                  value={
                    hero.primaryButtonTextAr
                  }
                  onChange={(event) =>
                    setHero((current) => ({
                      ...current,
                      primaryButtonTextAr:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                رابط الزر الرئيسي
                <input
                  value={
                    hero.primaryButtonUrl
                  }
                  onChange={(event) =>
                    setHero((current) => ({
                      ...current,
                      primaryButtonUrl:
                        event.target.value,
                    }))
                  }
                  dir="ltr"
                />
              </label>

              <label>
                نص الزر الثانوي
                <input
                  value={
                    hero.secondaryButtonTextAr
                  }
                  onChange={(event) =>
                    setHero((current) => ({
                      ...current,
                      secondaryButtonTextAr:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                رابط الزر الثانوي
                <input
                  value={
                    hero.secondaryButtonUrl
                  }
                  onChange={(event) =>
                    setHero((current) => ({
                      ...current,
                      secondaryButtonUrl:
                        event.target.value,
                    }))
                  }
                  dir="ltr"
                />
              </label>
            </div>

            <div className={styles.scheduleCard}>
              <header>
                <div>
                  <strong>الجدولة الذكية</strong>
                  <small>
                    اترك الحقلين فارغين للنشر دون
                    موعد انتهاء.
                  </small>
                </div>
              </header>

              <div className={styles.twoColumns}>
                <label>
                  بداية العرض
                  <input
                    type="datetime-local"
                    value={hero.startsAt}
                    onChange={(event) =>
                      setHero((current) => ({
                        ...current,
                        startsAt:
                          event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  نهاية العرض
                  <input
                    type="datetime-local"
                    value={hero.endsAt}
                    onChange={(event) =>
                      setHero((current) => ({
                        ...current,
                        endsAt:
                          event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </div>

            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={hero.active}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />
              تفعيل الخبر الرئيسي
            </label>

            <div className={styles.formFooter}>
              <button
                type="submit"
                disabled={saving}
                className={styles.primaryButton}
              >
                {saving
                  ? "جارٍ الحفظ..."
                  : hero.id
                    ? "حفظ التعديلات"
                    : "حفظ الخبر الرئيسي"}
              </button>

              {hero.id ? (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() =>
                    setHero(emptyHero)
                  }
                >
                  إنشاء Hero جديد
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <aside className={styles.previewPanel}>
          <header className={styles.previewHead}>
            <div>
              <span>LIVE PREVIEW</span>
              <h2>المعاينة الحيّة</h2>
            </div>

            <i className={styles.liveIndicator}>
              مباشر
            </i>
          </header>

          <div className={styles.heroPreview}>
            {hero.mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero.mediaUrl}
                alt={hero.titleAr || "معاينة Hero"}
              />
            ) : (
              <div
                className={
                  styles.previewPlaceholder
                }
              >
                <span>ب</span>
                <small>
                  اختر صورة الخبر الرئيسي
                </small>
              </div>
            )}

            <div className={styles.previewShade} />

            <div className={styles.previewGreeting}>
              <i />
              {hero.greetingAr ||
                "تحية نبض بيان"}
            </div>

            <div className={styles.previewContent}>
              <span>
                {hero.label || "BAYAN EDITION"}
              </span>

              <h2>
                {hero.titleAr ||
                  "سيظهر عنوان الخبر الرئيسي هنا."}
              </h2>

              <p>
                {hero.descriptionAr ||
                  "ستظهر مقدمة الخبر هنا أثناء الكتابة."}
              </p>

              <div className={styles.previewButtons}>
                <b>
                  {hero.primaryButtonTextAr ||
                    "الزر الرئيسي"}
                </b>
                <b>
                  {hero.secondaryButtonTextAr ||
                    "الزر الثانوي"}
                </b>
              </div>
            </div>
          </div>

          <div className={styles.previewMeta}>
            <div>
              <span>الفترة</span>
              <strong>{hero.slot}</strong>
            </div>

            <div>
              <span>الحالة</span>
              <strong>
                {currentHeroStatus.label}
              </strong>
            </div>

            <div>
              <span>الصورة</span>
              <strong>
                {hero.mediaUrl
                  ? "جاهزة"
                  : "غير محددة"}
              </strong>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.tickerWorkspace}>
        <div className={styles.tickerEditor}>
          <header className={styles.panelHead}>
            <div>
              <span>NEWS TICKER</span>
              <h2>إدارة شريط الأخبار</h2>
            </div>
          </header>

          <form
            onSubmit={submitTicker}
            className={styles.form}
          >
            <label>
              نص الخبر
              <textarea
                value={ticker.tickerTextAr}
                onChange={(event) =>
                  setTicker((current) => ({
                    ...current,
                    tickerTextAr:
                      event.target.value,
                  }))
                }
                rows={3}
                required
              />
            </label>

            <div className={styles.twoColumns}>
              <label>
                الترتيب
                <input
                  type="number"
                  step="10"
                  value={ticker.order}
                  onChange={(event) =>
                    setTicker((current) => ({
                      ...current,
                      order: Number(
                        event.target.value
                      ),
                    }))
                  }
                />
              </label>

              <label>
                حالة النشر
                <select
                  value={ticker.status}
                  onChange={(event) =>
                    setTicker((current) => ({
                      ...current,
                      status:
                        event.target.value,
                    }))
                  }
                >
                  <option value="published">
                    منشور
                  </option>
                  <option value="draft">
                    مسودة
                  </option>
                </select>
              </label>
            </div>

            <div className={styles.twoColumns}>
              <label>
                بداية العرض
                <input
                  type="datetime-local"
                  value={ticker.startsAt}
                  onChange={(event) =>
                    setTicker((current) => ({
                      ...current,
                      startsAt:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                نهاية العرض
                <input
                  type="datetime-local"
                  value={ticker.endsAt}
                  onChange={(event) =>
                    setTicker((current) => ({
                      ...current,
                      endsAt:
                        event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={ticker.active}
                onChange={(event) =>
                  setTicker((current) => ({
                    ...current,
                    active:
                      event.target.checked,
                  }))
                }
              />
              تفعيل عنصر الشريط
            </label>

            <button
              type="submit"
              disabled={saving}
              className={styles.primaryButton}
            >
              {ticker.id
                ? "حفظ تعديل الخبر"
                : "إضافة الخبر إلى الشريط"}
            </button>

            {ticker.id ? (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() =>
                  setTicker(emptyTicker)
                }
              >
                إلغاء التعديل
              </button>
            ) : null}
          </form>
        </div>

        <div className={styles.tickerManager}>
          <header className={styles.panelHead}>
            <div>
              <span>VISUAL ORDER</span>
              <h2>الترتيب والحالة</h2>
            </div>
          </header>

          <div className={styles.tickerPreview}>
            <strong>الآن في بيان</strong>

            <div>
              {(activeTickerTexts.length
                ? activeTickerTexts
                : [
                    "ستظهر الأخبار النشطة هنا بعد نشرها.",
                  ]
              ).map((value, index) => (
                <span key={`${value}-${index}`}>
                  {value}
                  <b>•</b>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.tickerList}>
            {loading ? (
              <p>جارٍ التحميل...</p>
            ) : tickers.length ? (
              tickers.map((item, index) => {
                const status =
                  visualStatus(item);

                return (
                  <article
                    key={item.id}
                    className={styles.tickerItem}
                  >
                    <div
                      className={
                        styles.orderControls
                      }
                    >
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() =>
                          void moveTicker(
                            item,
                            "up"
                          )
                        }
                        aria-label="تحريك لأعلى"
                      >
                        ↑
                      </button>

                      <strong>
                        {index + 1}
                      </strong>

                      <button
                        type="button"
                        disabled={
                          index ===
                          tickers.length - 1
                        }
                        onClick={() =>
                          void moveTicker(
                            item,
                            "down"
                          )
                        }
                        aria-label="تحريك لأسفل"
                      >
                        ↓
                      </button>
                    </div>

                    <div
                      className={
                        styles.tickerItemCopy
                      }
                    >
                      <div>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[
                              `status_${status.key}`
                            ]
                          }`}
                        >
                          {status.label}
                        </span>

                        <small>
                          الترتيب:{" "}
                          {Number(
                            item.order || 0
                          )}
                        </small>
                      </div>

                      <h3>
                        {item.tickerTextAr ||
                          item.titleAr}
                      </h3>

                      <p>{status.description}</p>
                    </div>

                    <div
                      className={
                        styles.itemActions
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          editTicker(item)
                        }
                      >
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void deleteItem(item.id)
                        }
                        className={
                          styles.deleteButton
                        }
                      >
                        حذف
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                لم تتم إضافة أخبار إلى الشريط.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.library}>
        <header className={styles.panelHead}>
          <div>
            <span>HERO LIBRARY</span>
            <h2>مكتبة الأخبار الرئيسية</h2>
          </div>
        </header>

        <div className={styles.heroGrid}>
          {loading ? (
            <p>جارٍ التحميل...</p>
          ) : heroes.length ? (
            heroes.map((item) => {
              const status =
                visualStatus(item);

              return (
                <article
                  key={item.id}
                  className={styles.heroCard}
                >
                  {item.mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.mediaUrl}
                      alt={item.titleAr || ""}
                    />
                  ) : (
                    <div
                      className={
                        styles.heroPlaceholder
                      }
                    >
                      ب
                    </div>
                  )}

                  <div>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[
                          `status_${status.key}`
                        ]
                      }`}
                    >
                      {status.label}
                    </span>

                    <small>
                      {item.slot || "all"}
                    </small>

                    <h3>{item.titleAr}</h3>
                    <p>{status.description}</p>

                    <div
                      className={
                        styles.itemActions
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          editHero(item)
                        }
                      >
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void deleteItem(item.id)
                        }
                        className={
                          styles.deleteButton
                        }
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              لم تتم إضافة أخبار رئيسية بعد.
            </div>
          )}
        </div>
      </section>

      {mediaOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMediaOpen(false);
            }
          }}
        >
          <section
            className={styles.mediaModal}
            role="dialog"
            aria-modal="true"
            aria-label="مكتبة الوسائط"
          >
            <header>
              <div>
                <span>MEDIA PICKER</span>
                <h2>مكتبة الوسائط</h2>
              </div>

              <button
                type="button"
                onClick={() => setMediaOpen(false)}
                aria-label="إغلاق"
              >
                ×
              </button>
            </header>

            <div className={styles.mediaToolbar}>
              <input
                value={mediaSearch}
                onChange={(event) =>
                  setMediaSearch(
                    event.target.value
                  )
                }
                placeholder="ابحث باسم الصورة..."
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
              >
                {uploading
                  ? "جارٍ الرفع..."
                  : "رفع صورة جديدة"}
              </button>
            </div>

            {mediaLoading ? (
              <div className={styles.mediaLoading}>
                جارٍ تحميل مكتبة الوسائط...
              </div>
            ) : mediaItems.length ? (
              <div className={styles.mediaGrid}>
                {mediaItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={styles.mediaCard}
                    onClick={() => {
                      setHero((current) => ({
                        ...current,
                        mediaUrl: item.url,
                      }));
                      setMediaOpen(false);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={
                        item.alt ||
                        item.originalName ||
                        item.name ||
                        "صورة"
                      }
                    />

                    <span>
                      <strong>
                        {item.originalName ||
                          item.name ||
                          "صورة"}
                      </strong>
                      <small>
                        {formatBytes(item.size)}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                لا توجد صور في المكتبة حتى الآن.
              </div>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
