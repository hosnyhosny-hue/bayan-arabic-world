"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SoundContextValue = {
  soundEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
  playSuccess: () => void;
};

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setSoundEnabled(
      window.localStorage.getItem("bayan-sound") === "enabled",
    );
  }, []);

  const play = (source: string) => {
    if (!soundEnabled) return;

    const audio = new Audio(source);
    audio.volume = 0.35;
    void audio.play().catch(() => undefined);
  };

  const value = useMemo(
    () => ({
      soundEnabled,
      toggleSound: () => {
        setSoundEnabled((current) => {
          const next = !current;

          window.localStorage.setItem(
            "bayan-sound",
            next ? "enabled" : "disabled",
          );

          return next;
        });
      },
      playClick: () => play("/sounds/click.wav"),
      playSuccess: () => play("/sounds/success.wav"),
    }),
    [soundEnabled],
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
