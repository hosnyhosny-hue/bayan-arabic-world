"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type BayanVoiceState = "idle" | "loading" | "playing" | "paused" | "missing" | "error";

export function useBayanVoiceEngine(dialogueUrl: string, ambienceUrl: string) {
  const dialogueRef = useRef<HTMLAudioElement | null>(null);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<BayanVoiceState>("idle");
  const [hasListened, setHasListened] = useState(false);
  const [ambienceEnabled, setAmbienceEnabled] = useState(true);

  useEffect(() => {
    const dialogue = new Audio(dialogueUrl);
    dialogue.preload = "metadata";
    dialogue.volume = 1;

    const ambience = new Audio(ambienceUrl);
    ambience.preload = "metadata";
    ambience.loop = true;
    ambience.volume = 0.16;

    dialogueRef.current = dialogue;
    ambienceRef.current = ambience;

    const onLoadStart = () => setState("loading");
    const onCanPlay = () => setState("idle");
    const onPlay = () => {
      setState("playing");
      if (ambienceEnabled) {
        ambience.volume = 0.06;
        void ambience.play().catch(() => undefined);
      }
    };
    const onPause = () => setState("paused");
    const onEnded = () => {
      setState("idle");
      setHasListened(true);
      ambience.volume = 0.16;
    };
    const onError = () => setState("missing");

    dialogue.addEventListener("loadstart", onLoadStart);
    dialogue.addEventListener("canplay", onCanPlay);
    dialogue.addEventListener("play", onPlay);
    dialogue.addEventListener("pause", onPause);
    dialogue.addEventListener("ended", onEnded);
    dialogue.addEventListener("error", onError);

    return () => {
      dialogue.pause();
      ambience.pause();
      dialogue.removeEventListener("loadstart", onLoadStart);
      dialogue.removeEventListener("canplay", onCanPlay);
      dialogue.removeEventListener("play", onPlay);
      dialogue.removeEventListener("pause", onPause);
      dialogue.removeEventListener("ended", onEnded);
      dialogue.removeEventListener("error", onError);
      dialogueRef.current = null;
      ambienceRef.current = null;
    };
  }, [ambienceEnabled, ambienceUrl, dialogueUrl]);

  const playDialogue = useCallback(async () => {
    const dialogue = dialogueRef.current;
    if (!dialogue) return;

    if (state === "playing") {
      dialogue.pause();
      return;
    }

    try {
      setState("loading");
      dialogue.currentTime = 0;
      await dialogue.play();
    } catch {
      setState("error");
    }
  }, [state]);

  const toggleAmbience = useCallback(async () => {
    const ambience = ambienceRef.current;
    if (!ambience) return;

    if (ambienceEnabled) {
      ambience.pause();
      setAmbienceEnabled(false);
      return;
    }

    setAmbienceEnabled(true);
    ambience.volume = 0.16;
    try {
      await ambience.play();
    } catch {
      // Browsers may require the learner to press play on the dialogue first.
    }
  }, [ambienceEnabled]);

  return {
    state,
    hasListened,
    ambienceEnabled,
    playDialogue,
    toggleAmbience,
  };
}
