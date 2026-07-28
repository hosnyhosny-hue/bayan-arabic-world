"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Language = "ar" | "en";
type SoundType = "hover" | "click" | "success";

type WorldContextValue = {
  language: Language;
  isArabic: boolean;
  direction: "rtl" | "ltr";
  soundEnabled: boolean;
  toggleLanguage: () => void;
  toggleSound: () => void;
  playSound: (type?: SoundType) => void;
};

const WorldContext = createContext<WorldContextValue | null>(null);

export function WorldProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContext = useRef<AudioContext | null>(null);
  const lastHover = useRef(0);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("bayan-language");
    const savedSound = localStorage.getItem("bayan-sound");

    if (savedLanguage === "ar" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }

    if (savedSound === "off") {
      setSoundEnabled(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!audioContext.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return null;
      audioContext.current = new AudioContextClass();
    }

    if (audioContext.current.state === "suspended") {
      void audioContext.current.resume();
    }

    return audioContext.current;
  }, []);

  useEffect(() => {
    const unlock = () => {
      getAudioContext();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [getAudioContext]);

  const playSound = useCallback(
    (type: SoundType = "click") => {
      if (!soundEnabled) return;

      if (type === "hover") {
        const now = Date.now();
        if (now - lastHover.current < 100) return;
        lastHover.current = now;
      }

      const context = getAudioContext();
      if (!context) return;

      const frequencies =
        type === "hover"
          ? [540]
          : type === "success"
            ? [520, 660, 820]
            : [420, 560];

      frequencies.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + index * 0.07;
        const duration = type === "hover" ? 0.045 : 0.085;

        oscillator.type = type === "success" ? "sine" : "triangle";
        oscillator.frequency.setValueAtTime(frequency, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(
          type === "hover" ? 0.025 : 0.055,
          start + 0.01,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + duration,
        );

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.02);
      });
    },
    [getAudioContext, soundEnabled],
  );

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => {
      const next = current === "ar" ? "en" : "ar";
      localStorage.setItem("bayan-language", next);
      return next;
    });
    playSound("click");
  }, [playSound]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => {
      const next = !current;
      localStorage.setItem("bayan-sound", next ? "on" : "off");

      if (next) {
        setTimeout(() => playSound("success"), 20);
      }

      return next;
    });
  }, [playSound]);

  const value = useMemo(
    () => ({
      language,
      isArabic: language === "ar",
      direction: language === "ar" ? ("rtl" as const) : ("ltr" as const),
      soundEnabled,
      toggleLanguage,
      toggleSound,
      playSound,
    }),
    [
      language,
      soundEnabled,
      toggleLanguage,
      toggleSound,
      playSound,
    ],
  );

  return (
    <WorldContext.Provider value={value}>
      {children}
    </WorldContext.Provider>
  );
}

export function useWorld() {
  const context = useContext(WorldContext);

  if (!context) {
    throw new Error("useWorld must be used inside WorldProvider");
  }

  return context;
}
