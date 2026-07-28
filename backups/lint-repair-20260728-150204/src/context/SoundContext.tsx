"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SoundContextValue = {
  soundEnabled: boolean;
  toggleSound: () => void;
  playHover: () => void;
  playClick: () => void;
  playSuccess: () => void;
};

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastHoverRef = useRef(0);

  useEffect(() => {
    setSoundEnabled(
      window.localStorage.getItem("bayan-sound") === "enabled",
    );
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return null;

      audioContextRef.current = new AudioContextClass();
    }

    return audioContextRef.current;
  }, []);

  const playNotes = useCallback(
    (
      notes: number[],
      duration = 0.12,
      volume = 0.045,
      waveform: OscillatorType = "sine",
    ) => {
      if (!soundEnabled) return;

      const context = getAudioContext();
      if (!context) return;

      const startPlayback = () => {
        const now = context.currentTime;

        notes.forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();

          oscillator.type = waveform;
          oscillator.frequency.setValueAtTime(frequency, now);

          const start = now + index * duration * 0.7;
          const end = start + duration;

          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
          gain.gain.exponentialRampToValueAtTime(0.0001, end);

          oscillator.connect(gain);
          gain.connect(context.destination);

          oscillator.start(start);
          oscillator.stop(end + 0.02);
        });
      };

      if (context.state === "suspended") {
        void context.resume().then(startPlayback).catch(() => undefined);
      } else {
        startPlayback();
      }
    },
    [getAudioContext, soundEnabled],
  );

  const playHover = useCallback(() => {
    const now = Date.now();

    // منع تكرار الصوت بشكل مزعج مع حركة المؤشر السريعة.
    if (now - lastHoverRef.current < 160) return;

    lastHoverRef.current = now;
    playNotes([880], 0.055, 0.018, "sine");
  }, [playNotes]);

  const playClick = useCallback(() => {
    playNotes([659, 784], 0.075, 0.035, "triangle");
  }, [playNotes]);

  const playSuccess = useCallback(() => {
    playNotes([523, 659, 784, 1047], 0.11, 0.045, "triangle");
  }, [playNotes]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => {
      const next = !current;

      window.localStorage.setItem(
        "bayan-sound",
        next ? "enabled" : "disabled",
      );

      if (next) {
        window.setTimeout(() => {
          const context = getAudioContext();

          if (context?.state === "suspended") {
            void context.resume();
          }
        }, 0);
      }

      return next;
    });
  }, [getAudioContext]);

  const value = useMemo(
    () => ({
      soundEnabled,
      toggleSound,
      playHover,
      playClick,
      playSuccess,
    }),
    [
      soundEnabled,
      toggleSound,
      playHover,
      playClick,
      playSuccess,
    ],
  );

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error("useSound must be used inside SoundProvider.");
  }

  return context;
}
