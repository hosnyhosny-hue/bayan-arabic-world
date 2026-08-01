"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./Hero.module.css";

type HeroProps = {
  isArabic: boolean;
  openPlacement: () => void;
};

const greetings = [
  { primary: "أَهْلًا", secondary: "Welcome" },
  { primary: "Hello", secondary: "أَهْلًا وَسَهْلًا" },
  { primary: "Bonjour", secondary: "مَرْحَبًا" },
  { primary: "Hola", secondary: "أَهْلًا بِكَ" },
];

const orbitWords = [
  { word: "Hello", className: "wordOne" },
  { word: "مَرْحَبًا", className: "wordTwo" },
  { word: "Bonjour", className: "wordThree" },
  { word: "شُكْرًا", className: "wordFour" },
  { word: "Hola", className: "wordFive" },
  { word: "أَهْلًا", className: "wordSix" },
];

export default function Hero({
  isArabic,
  openPlacement,
}: HeroProps) {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [conversationState, setConversationState] = useState<
    "ready" | "listening" | "thinking" | "feedback"
  >("ready");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 70,
    damping: 22,
    mass: 0.8,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 70,
    damping: 22,
    mass: 0.8,
  });

  const planetX = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const planetY = useTransform(smoothY, [-0.5, 0.5], [-14, 14]);
  const backgroundX = useTransform(smoothX, [-0.5, 0.5], [12, -12]);
  const backgroundY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGreetingIndex((current) => (current + 1) % greetings.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  function handlePointerMove(
    event: React.PointerEvent<HTMLElement>,
  ) {
    const rect = event.currentTarget.getBoundingClientRect();

    mouseX.set(
      (event.clientX - rect.left) / rect.width - 0.5,
    );

    mouseY.set(
      (event.clientY - rect.top) / rect.height - 0.5,
    );
  }

  function resetParallax() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function startConversation() {
    setConversationOpen(true);
    setConversationState("listening");

    window.setTimeout(() => {
      setConversationState("thinking");
    }, 1800);

    window.setTimeout(() => {
      setConversationState("feedback");
    }, 3200);
  }

  function closeConversation() {
    setConversationOpen(false);
    setConversationState("ready");
  }

  return (
    <>
      <section id="speak"
        className={styles.hero}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetParallax}
      >
        <motion.div
          className={styles.ambientGlowOne}
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />

        <motion.div
          className={styles.ambientGlowTwo}
          style={{
            x: planetX,
            y: planetY,
          }}
        />

        <div className={styles.gridOverlay} />

        <div className={styles.heroInner}>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.div
              className={styles.eyebrow}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <span className={styles.cefrBadge}>
                CEFR A0–B2
              </span>

              <span className={styles.learnerBadge}>
                {isArabic
                  ? "تجربة عربية لغير الناطقين بها"
                  : "Arabic for Non-Native Speakers"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.22,
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {isArabic ? (
                <>
                  تَعَلَّمِ العَرَبِيَّةَ
                  <span> كَمَا تُعَاشُ.</span>
                </>
              ) : (
                <>
                  Learn Arabic
                  <span> for real life.</span>
                </>
              )}
            </motion.h1>

            <motion.p
              className={styles.lead}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.7 }}
            >
              {isArabic
                ? "رحلة تفاعلية حيّة تساعدك على الاستماع والفهم والتحدث بالعربية في المدرسة والحياة اليومية، خطوةً بخطوة."
                : "A living, interactive journey that helps you listen, understand and speak Arabic at school and in everyday life—one confident step at a time."}
            </motion.p>

            <motion.div
              className={styles.actions}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.65 }}
            >
              <button
                type="button"
                className={styles.primaryButton}
                onClick={openPlacement}
              >
                <span className={styles.buttonSpark}>✦</span>
                <span>
                  {isArabic
                    ? "ابدأ اختبار تحديد المستوى"
                    : "Take the Placement Check"}
                </span>
              </button>

              <a
                href="#journey"
                className={styles.secondaryButton}
              >
                <span>
                  {isArabic
                    ? "استكشف رحلة التعلّم"
                    : "Explore the Journey"}
                </span>
                <span className={styles.arrow}>↓</span>
              </a>
            </motion.div>

            <motion.div
              className={styles.trustRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.58, duration: 0.7 }}
            >
              <span>
                <b>✓</b>
                {isArabic ? " مواقف حقيقية" : " Real-life contexts"}
              </span>

              <span>
                <b>✓</b>
                {isArabic ? " تعلّم بالصوت" : " Voice-first learning"}
              </span>

              <span>
                <b>✓</b>
                {isArabic ? " مسار متدرج" : " Personalised pathway"}
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.worldStage}
            style={{
              x: planetX,
              y: planetY,
            }}
            initial={{ opacity: 0, scale: 0.84 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.18,
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-hidden="true"
          >
            <div className={styles.planetAura} />
            <div className={styles.orbitOuter} />
            <div className={styles.orbitMiddle} />
            <div className={styles.orbitInner} />

            <div className={styles.orbitDots}>
              <span />
              <span />
              <span />
            </div>

            <motion.div
              className={styles.planet}
              animate={{
                scale: [1, 1.025, 1],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className={styles.planetTexture} />
              <div className={styles.planetHighlight} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={greetingIndex}
                  className={styles.greeting}
                  initial={{
                    opacity: 0,
                    y: 14,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -12,
                    scale: 0.98,
                  }}
                  transition={{ duration: 0.45 }}
                >
                  <strong>
                    {greetings[greetingIndex].primary}
                  </strong>
                  <span>
                    {greetings[greetingIndex].secondary}
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <div className={styles.rotatingWords}>
              {orbitWords.map((item) => (
                <div
                  key={`${item.word}-${item.className}`}
                  className={`${styles.orbitWord} ${
                    styles[item.className]
                  }`}
                >
                  {item.word}
                </div>
              ))}
            </div>

            <motion.div
              className={`${styles.contextCard} ${styles.schoolCard}`}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span>🏫</span>
              <div>
                <small>
                  {isArabic ? "المحطة الأولى" : "First stop"}
                </small>
                <strong>
                  {isArabic ? "في المدرسة" : "At school"}
                </strong>
              </div>
            </motion.div>

            <motion.div
              className={`${styles.contextCard} ${styles.canteenCard}`}
              animate={{ y: [0, 7, 0] }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            >
              <span>🥪</span>
              <div>
                <small>
                  {isArabic ? "تَحَدَّثْ" : "Speak"}
                </small>
                <strong>
                  {isArabic ? "في المقصف" : "At the canteen"}
                </strong>
              </div>
            </motion.div>

            <motion.div
              className={`${styles.contextCard} ${styles.cityCard}`}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 5.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            >
              <span>📍</span>
              <div>
                <small>
                  {isArabic ? "اِسْتَكْشِفْ" : "Explore"}
                </small>
                <strong>
                  {isArabic ? "في الدوحة" : "Around Doha"}
                </strong>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className={styles.scrollHint}>
          <span>{isArabic ? "اكتشف الرحلة" : "Discover the journey"}</span>
          <i />
        </div>
      </section>

      <motion.button
        type="button"
        className={styles.speakFab}
        onClick={startConversation}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        aria-label={
          isArabic ? "تحدث بالعربية" : "Speak Arabic"
        }
      >
        <span className={styles.microphone}>🎙</span>

        <span className={styles.speakText}>
          <strong>
            {isArabic ? "تَحَدَّثْ بِالعَرَبِيَّةِ" : "Speak Arabic"}
          </strong>
          <small>
            {isArabic ? "ابدأ محادثة" : "Start a conversation"}
          </small>
        </span>

        <span className={styles.liveDot} />
      </motion.button>

      <AnimatePresence>
        {conversationOpen && (
          <motion.div
            className={styles.conversationBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={closeConversation}
          >
            <motion.div
              className={styles.conversationPanel}
              initial={{
                opacity: 0,
                y: 80,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 70,
                scale: 0.97,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 25,
              }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeConversation}
                aria-label="Close"
              >
                ×
              </button>

              <div className={styles.bayanIdentity}>
                <div className={styles.bayanAvatar}>ب</div>
                <div>
                  <small>BAYAN AI</small>
                  <strong>
                    {isArabic
                      ? "مُدَرِّبُكَ اللُّغَوِيُّ"
                      : "Your Arabic speaking coach"}
                  </strong>
                </div>
              </div>

              <div className={styles.conversationBody}>
                {conversationState === "listening" && (
                  <>
                    <div className={styles.voiceOrb}>
                      <div className={styles.waveBars}>
                        {Array.from({ length: 14 }).map((_, index) => (
                          <span
                            key={index}
                            style={{
                              animationDelay: `${index * 0.06}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <h3>
                      {isArabic ? "أَسْتَمِعُ إِلَيْكَ..." : "Listening..."}
                    </h3>

                    <p>
                      {isArabic
                        ? "قُلْ: مَا اسْمُكَ؟"
                        : "Say: مَا اسْمُكَ؟"}
                    </p>
                  </>
                )}

                {conversationState === "thinking" && (
                  <>
                    <div className={styles.thinkingOrb}>
                      <span />
                      <span />
                      <span />
                    </div>

                    <h3>
                      {isArabic
                        ? "بَيَانُ يُحَلِّلُ نُطْقَكَ"
                        : "BAYAN is analysing your pronunciation"}
                    </h3>

                    <p>
                      {isArabic
                        ? "ثَوَانٍ قَلِيلَةٌ..."
                        : "Just a moment..."}
                    </p>
                  </>
                )}

                {conversationState === "feedback" && (
                  <>
                    <div className={styles.scoreRing}>
                      <div>
                        <strong>92</strong>
                        <span>/100</span>
                      </div>
                    </div>

                    <h3>
                      {isArabic ? "مُمْتَازٌ!" : "Excellent!"}
                    </h3>

                    <p>
                      {isArabic
                        ? "نُطْقُكَ وَاضِحٌ. حَاوِلْ أَنْ تُمِدَّ صَوْتَ الأَلِفِ قَلِيلًا."
                        : "Your pronunciation is clear. Try holding the long Arabic vowel slightly longer."}
                    </p>

                    <div className={styles.feedbackStats}>
                      <span>
                        <small>
                          {isArabic ? "الدقة" : "Accuracy"}
                        </small>
                        <strong>94%</strong>
                      </span>

                      <span>
                        <small>
                          {isArabic ? "الطلاقة" : "Fluency"}
                        </small>
                        <strong>89%</strong>
                      </span>

                      <span>
                        <small>
                          {isArabic ? "الثقة" : "Confidence"}
                        </small>
                        <strong>93%</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      className={styles.continueButton}
                      onClick={() =>
                        setConversationState("listening")
                      }
                    >
                      {isArabic
                        ? "وَاصِلِ المُحَادَثَةَ"
                        : "Continue Conversation"}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
