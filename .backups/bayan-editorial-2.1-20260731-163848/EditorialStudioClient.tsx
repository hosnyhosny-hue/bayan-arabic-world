"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
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
  order: 0,
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

  const offset =
    date.getTimezoneOffset() * 60_000;

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

export default function EditorialStudioClient() {
  const [items, setItems] =
    useState<EditorialItem[]>([]);

  const [hero, setHero] =
    useState<HeroForm>(emptyHero);

  const [ticker, setTicker] =
    useState<TickerForm>(emptyTicker);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const heroes = useMemo(
    () =>
      items.filter(
        (item) => item.type === "hero"
      ),
    [items]
  );

  const tickers = useMemo(
    () =>
      items
        .filter(
          (item) => item.type === "ticker"
        )
        .sort(
          (a, b) =>
            Number(a.order || 0) -
            Number(b.order || 0)
        ),
    [items]
  );

  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/cms/editorial",
        {
          cache: "no-store",
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error || "تعذر تحميل المحتوى."
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

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function savePayload(
    payload: Record<string, unknown>
  ) {
    setSaving(true);
    setMessage("");

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

      setMessage("تم حفظ المحتوى بنجاح.");
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
      setSaving(false);
    }
  }

  async function submitHero(
    event: FormEvent
  ) {
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

  async function submitTicker(
    event: FormEvent
  ) {
    event.preventDefault();

    const saved = await savePayload({
      ...ticker,
      type: "ticker",
      startsAt: apiDate(ticker.startsAt),
      endsAt: apiDate(ticker.endsAt),
    });

    if (saved) {
      setTicker(emptyTicker);
    }
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm(
      "هل تريد حذف هذا المحتوى نهائيًا؟"
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/cms/editorial?id=${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
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
      startsAt: dateTimeInput(
        item.startsAt
      ),
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
      status:
        item.status || "published",
      active: item.active !== false,
      startsAt: dateTimeInput(
        item.startsAt
      ),
      endsAt: dateTimeInput(item.endsAt),
    });
  }

  return (
    <main
      className={styles.page}
      dir="rtl"
    >
      <header className={styles.heroHeader}>
        <div>
          <span>BAYAN CMS 2.0</span>
          <h1>الاستوديو التحريري</h1>
          <p>
            تحكم في الخبر الرئيسي وشريط
            الأخبار من واجهة واحدة.
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
                  item.status === "published" &&
                  item.active !== false
              ).length
            }
          </strong>
          <span>منشور الآن</span>
        </article>
      </section>

      <div className={styles.workspace}>
        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <div>
              <span>HERO EDITOR</span>
              <h2>الخبر الرئيسي</h2>
            </div>

            {hero.id ? (
              <button
                type="button"
                onClick={() =>
                  setHero(emptyHero)
                }
                className={styles.textButton}
              >
                إنشاء جديد
              </button>
            ) : null}
          </header>

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
                      status:
                        event.target.value,
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
                placeholder="صباح الخير من بيان"
              />
            </label>

            <label>
              الوسم الإنجليزي
              <input
                value={hero.label}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    label:
                      event.target.value,
                  }))
                }
                placeholder="MORNING EDITION"
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
                    titleAr:
                      event.target.value,
                  }))
                }
                rows={3}
                required
              />
            </label>

            <label>
              الوصف
              <textarea
                value={
                  hero.descriptionAr
                }
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

            <label>
              رابط الصورة
              <input
                value={hero.mediaUrl}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    mediaUrl:
                      event.target.value,
                  }))
                }
                placeholder="/images/bayan/hero.jpg أو رابط Firebase"
                dir="ltr"
              />
            </label>

            {hero.mediaUrl ? (
              <div
                className={
                  styles.imagePreview
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.mediaUrl}
                  alt="معاينة الخبر الرئيسي"
                />
              </div>
            ) : null}

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

            <label
              className={styles.checkLabel}
            >
              <input
                type="checkbox"
                checked={hero.active}
                onChange={(event) =>
                  setHero((current) => ({
                    ...current,
                    active:
                      event.target.checked,
                  }))
                }
              />
              تفعيل الخبر الرئيسي
            </label>

            <button
              type="submit"
              disabled={saving}
              className={styles.primaryButton}
            >
              {saving
                ? "جارٍ الحفظ..."
                : hero.id
                  ? "حفظ التعديلات"
                  : "نشر الخبر الرئيسي"}
            </button>
          </form>
        </section>

        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <div>
              <span>NEWS TICKER</span>
              <h2>شريط الأخبار</h2>
            </div>
          </header>

          <form
            onSubmit={submitTicker}
            className={styles.form}
          >
            <label>
              نص الخبر
              <textarea
                value={
                  ticker.tickerTextAr
                }
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
                الحالة
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

            <label
              className={styles.checkLabel}
            >
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
              تفعيل الخبر
            </label>

            <button
              type="submit"
              disabled={saving}
              className={styles.primaryButton}
            >
              {saving
                ? "جارٍ الحفظ..."
                : ticker.id
                  ? "حفظ تعديل الخبر"
                  : "إضافة إلى الشريط"}
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

          <div className={styles.list}>
            <h3>الأخبار الحالية</h3>

            {loading ? (
              <p>جارٍ التحميل...</p>
            ) : tickers.length ? (
              tickers.map((item) => (
                <article
                  key={item.id}
                  className={styles.listItem}
                >
                  <div>
                    <span>
                      #{Number(
                        item.order || 0
                      )}
                    </span>

                    <strong>
                      {item.tickerTextAr ||
                        item.titleAr}
                    </strong>

                    <small>
                      {item.status ===
                      "published"
                        ? "منشور"
                        : "مسودة"}
                      {item.active === false
                        ? " · غير مفعّل"
                        : ""}
                    </small>
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
                        deleteItem(item.id)
                      }
                      className={
                        styles.deleteButton
                      }
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p>
                لم تتم إضافة أخبار للشريط
                بعد.
              </p>
            )}
          </div>
        </section>
      </div>

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
            heroes.map((item) => (
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
                  <span>
                    {item.slot || "all"}
                  </span>
                  <h3>{item.titleAr}</h3>
                  <p>
                    {item.status ===
                    "published"
                      ? "منشور"
                      : "مسودة"}
                  </p>

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
                        deleteItem(item.id)
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
            ))
          ) : (
            <p>
              لم تتم إضافة أخبار رئيسية
              بعد.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
