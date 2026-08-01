"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import type { LearnerJourneyState } from "../lib/journey-types";
import type { MissionScene, StageSceneExperience } from "../lib/story-scene-types";
import type { WorldExperienceContent } from "../lib/world-experience-types";
import { useBayanVoiceEngine } from "../lib/bayan-voice-engine";
import { BAYAN_WORLD_VOICES, DIACRITIZED_DIALOGUES, getAmbienceAudioUrl, getDialogueAudioUrl } from "../lib/bayan-voice-manifest";
import { assessLearnerSpeech } from "../lib/speech-assessment-client";

import styles from "../story-experience.module.css";

const STORAGE_KEY = "bayan-arabic-b-journey-v1";
const STORAGE_EVENT = "bayan-journey-update";

const EMPTY_STATE: LearnerJourneyState = {
  version: 1,
  xp: 260,
  streak: 7,
  lastVisitDate: "",
  activeWorldId: "school",
  activeStageIndex: 0,
  completedStageIds: [],
  completedMissionIds: [],
  worldProgress: {},
};

type RecognitionEventLike = Event & {
  results: { [index: number]: { 0: { transcript: string } }; length: number };
};

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type RecognitionConstructor = new () => RecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

function normalizeArabic(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FF0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(actual: string, target: string): number {
  const actualWords = new Set(normalizeArabic(actual).split(" ").filter(Boolean));
  const targetWords = new Set(normalizeArabic(target).split(" ").filter(Boolean));
  if (targetWords.size === 0) return 0;
  let matched = 0;
  targetWords.forEach((word) => {
    if (actualWords.has(word)) matched += 1;
  });
  return Math.round((matched / targetWords.size) * 100);
}

function readState(value: string | null): LearnerJourneyState {
  if (!value) return EMPTY_STATE;
  try {
    return { ...EMPTY_STATE, ...(JSON.parse(value) as Partial<LearnerJourneyState>) };
  } catch {
    return EMPTY_STATE;
  }
}

function getSnapshot(): string {
  if (typeof window === "undefined") return JSON.stringify(EMPTY_STATE);
  return window.localStorage.getItem(STORAGE_KEY) ?? JSON.stringify(EMPTY_STATE);
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", storageHandler);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function saveJourney(updater: (state: LearnerJourneyState) => LearnerJourneyState): void {
  const current = readState(window.localStorage.getItem(STORAGE_KEY));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updater(current)));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export default function ArabicBSceneMission({
  world,
  experience,
}: {
  world: WorldExperienceContent;
  experience: StageSceneExperience;
}) {
  const rawState = useSyncExternalStore(subscribe, getSnapshot, () => JSON.stringify(EMPTY_STATE));
  const journey = useMemo(() => readState(rawState), [rawState]);
  const stageStorageId = `${world.id}:${experience.stageId}`;
  const completed = journey.completedStageIds.includes(stageStorageId);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [choiceCorrect, setChoiceCorrect] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [voiceMessage, setVoiceMessage] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const scene = experience.scenes[sceneIndex];
  const worldVoice = BAYAN_WORLD_VOICES[world.id];
  const professionalText = DIACRITIZED_DIALOGUES[world.id]?.[experience.stageId] ?? scene.audioTextAr ?? "";
  const voiceEngine = useBayanVoiceEngine(
    getDialogueAudioUrl(world.id, experience.stageId),
    getAmbienceAudioUrl(world.id),
  );
  const progress = Math.round(((sceneIndex + 1) / experience.scenes.length) * 100);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  async function startRecording(): Promise<void> {
    setVoiceMessage("");
    setTranscript("");
    setScore(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceMessage("الميكروفون غير مدعوم في هذا المتصفح.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        setRecordingUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (Recognition) {
        const recognition = new Recognition();
        recognition.lang = "ar-QA";
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.onresult = (event) => {
          const result = event.results[event.results.length - 1]?.[0]?.transcript ?? "";
          setTranscript(result);
          if (scene.modelAnswerAr) setScore(similarity(result, scene.modelAnswerAr));
        };
        recognition.onerror = () => setVoiceMessage("تم حفظ التسجيل، لكن تحويل الصوت إلى نص غير متاح حاليًا.");
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        setVoiceMessage("سيتم حفظ التسجيل. التقييم النصي غير مدعوم في هذا المتصفح.");
      }

      recorder.start();
      setIsRecording(true);
    } catch {
      setVoiceMessage("لم يتم السماح باستخدام الميكروفون. فعّل الإذن من إعدادات المتصفح.");
    }
  }

  function stopRecording(): void {
    recorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  function choose(choice: NonNullable<MissionScene["choices"]>[number]): void {
    setSelectedChoice(choice.id);
    setChoiceCorrect(choice.correct);
  }

  function nextScene(): void {
    setSelectedChoice(null);
    setChoiceCorrect(null);
    setVoiceMessage("");
    setSceneIndex((current) => Math.min(current + 1, experience.scenes.length - 1));
  }

  function completeStage(): void {
    saveJourney((current) => {
      if (current.completedStageIds.includes(stageStorageId)) return current;
      const completedStageIds = [...current.completedStageIds, stageStorageId];
      const completedInWorld = world.stages.filter((stage) => completedStageIds.includes(stage.id)).length;
      return {
        ...current,
        xp: current.xp + experience.xp,
        activeWorldId: world.id,
        activeStageIndex: Math.min(completedInWorld, world.stages.length - 1),
        completedStageIds,
        worldProgress: {
          ...current.worldProgress,
          [world.id]: Math.round((completedInWorld / world.stages.length) * 100),
        },
        lastVisitDate: new Date().toISOString(),
      };
    });
  }

  const canContinue = scene.kind !== "choice" || choiceCorrect === true;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href={`/learn/arabic-b/worlds/${world.id}`}><span>→</span>{world.titleAr}</Link>
        <div className={styles.progressWrap}>
          <div className={styles.progressTrack}><span style={{ width: `${progress}%` }} /></div>
          <small>{sceneIndex + 1}/{experience.scenes.length}</small>
        </div>
        <div className={styles.stats}><span>🔥 {journey.streak}</span><strong>✦ {journey.xp} XP</strong></div>
      </header>

      <section className={styles.stageHeader}>
        <div className={styles.icon}>{experience.icon}</div>
        <div><small>{experience.stageTitleEn} · {world.level}</small><h1>{experience.stageTitleAr}</h1></div>
      </section>

      <section className={styles.sceneShell}>
        <article className={styles.sceneCard}>
          <div className={styles.sceneLabel}><span>{scene.eyebrowAr}</span><small>{world.locationAr}</small></div>

          {scene.speakerAr && (
            <div className={styles.character}>
              <div>{worldVoice.avatar}</div>
              <span><small>{world.character.roleAr}</small><strong>{scene.speakerAr}</strong></span>
            </div>
          )}

          <h2>{scene.titleAr}</h2>
          <p className={styles.body}>{scene.bodyAr}</p>

          {scene.audioTextAr && (
            <div className={styles.audioPanel}>
              <div className={styles.listenFirst}>
                <small>اِسْتَمِعْ أَوَّلًا</small>
                {voiceEngine.hasListened ? (
                  <strong>{professionalText}</strong>
                ) : (
                  <strong className={styles.hiddenTranscript}>النَّصُّ مَخْفِيٌّ حَتَّى تُكْمِلَ الِاسْتِمَاعَ.</strong>
                )}
                <button
                  className={styles.ambienceButton}
                  onClick={() => void voiceEngine.toggleAmbience()}
                  type="button"
                >
                  {voiceEngine.ambienceEnabled ? "🌿 أَوْقِفِ الْأَجْوَاءَ" : "🌿 شَغِّلِ الْأَجْوَاءَ"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => void voiceEngine.playDialogue()}
                disabled={voiceEngine.state === "missing"}
              >
                {voiceEngine.state === "playing" ? "⏸ إِيقَافٌ مُؤَقَّتٌ" : voiceEngine.state === "loading" ? "جَارِي التَّحْمِيلِ…" : "🔊 اِسْتَمِعْ"}
              </button>
              {voiceEngine.state === "missing" && (
                <p className={styles.audioMissing}>لَمْ يُعْثَرْ عَلَى الْمِلَفِّ الصَّوْتِيِّ الِاحْتِرَافِيِّ. شَغِّلْ سْكْرِبْتَ تَوْلِيدِ الصَّوْتِ أَوْ أَضِفْ مِلَفَّ MP3.</p>
              )}
            </div>
          )}

          {scene.choices && (
            <div className={styles.choiceGrid}>
              {scene.choices.map((choice) => {
                const selected = selectedChoice === choice.id;
                return (
                  <button
                    className={selected ? (choice.correct ? styles.choiceCorrect : styles.choiceWrong) : styles.choice}
                    key={choice.id}
                    onClick={() => choose(choice)}
                    type="button"
                  >
                    <span>{choice.labelAr}</span>
                    {selected && <small>{choice.feedbackAr}</small>}
                  </button>
                );
              })}
            </div>
          )}

          {scene.kind === "speak" && (
            <div className={styles.voiceStudio}>
              <div className={styles.voiceTop}>
                <div><small>استوديو النطق</small><strong>{scene.promptAr}</strong></div>
                <button
                  className={isRecording ? styles.stopRecording : styles.startRecording}
                  onClick={isRecording ? stopRecording : () => void startRecording()}
                  type="button"
                >
                  {isRecording ? "■ أوقف التسجيل" : "🎙️ ابدأ التسجيل"}
                </button>
              </div>
              {scene.hintAr && <div className={styles.hint}><span>تلميح</span>{scene.hintAr}</div>}
              {recordingUrl && <audio className={styles.audioPlayer} controls src={recordingUrl} />}
              {transcript && <div className={styles.transcript}><small>ما التقطه المتصفح</small><p>{transcript}</p></div>}
              {score !== null && (
                <div className={styles.score}>
                  <div><small>تطابق الكلمات</small><strong>{score}%</strong></div>
                  <span>{score >= 80 ? "ممتاز — العبارة واضحة." : score >= 55 ? "جيد — أعدها ببطء." : "استمع للنموذج ثم حاول مجددًا."}</span>
                </div>
              )}
              {voiceMessage && <p className={styles.voiceMessage}>{voiceMessage}</p>}
            </div>
          )}

          {scene.kind === "result" && (
            <div className={styles.resultPanel}>
              <div>🏅</div><span>مكافأة المرحلة</span><strong>+{experience.xp} XP</strong>
              <p>{completed ? "سبق أن أكملت هذه المرحلة." : "اضغط الزر لحفظ تقدمك."}</p>
            </div>
          )}
        </article>

        <aside className={styles.sceneRail}>
          {experience.scenes.map((item, index) => (
            <button
              className={index === sceneIndex ? styles.railActive : index < sceneIndex ? styles.railDone : styles.railItem}
              key={item.id}
              onClick={() => setSceneIndex(index)}
              type="button"
            >
              <span>{index < sceneIndex ? "✓" : index + 1}</span><small>{item.eyebrowAr}</small>
            </button>
          ))}
        </aside>
      </section>

      <footer className={styles.actions}>
        <button disabled={sceneIndex === 0} onClick={() => setSceneIndex((current) => Math.max(current - 1, 0))} type="button">السابق</button>
        {scene.kind === "result" ? (
          <button className={styles.primary} disabled={completed} onClick={completeStage} type="button">
            {completed ? "المرحلة مكتملة ✓" : `إكمال المرحلة وكسب ${experience.xp} XP`}
          </button>
        ) : (
          <button className={styles.primary} disabled={!canContinue} onClick={nextScene} type="button">
            {scene.kind === "choice" && choiceCorrect !== true ? "اختر الإجابة الصحيحة" : "المشهد التالي ←"}
          </button>
        )}
      </footer>
    </main>
  );
}
