"use client";

import { useMemo, useRef, useState } from "react";
import { assessText, trackLearningEvent } from "./core";
import type { NormalizedMission, SubmissionResult } from "./types";

export default function MissionRenderer({
  mission,
  onSubmit,
}: {
  mission: NormalizedMission;
  onSubmit: (result: SubmissionResult) => void;
}) {
  if (mission.type === "listening") {
    return <Listening mission={mission} onSubmit={onSubmit} />;
  }
  if (mission.type === "writing") {
    return <Writing mission={mission} onSubmit={onSubmit} />;
  }
  if (mission.type === "ordering" || mission.type === "drag-drop") {
    return <Ordering mission={mission} onSubmit={onSubmit} />;
  }
  if (mission.type === "recording" || mission.type === "pronunciation") {
    return (
      <Recording
        mission={mission}
        onSubmit={onSubmit}
        pronunciation={mission.type === "pronunciation"}
      />
    );
  }
  return <ChoiceActivity mission={mission} onSubmit={onSubmit} />;
}

function ChoiceActivity({
  mission,
  onSubmit,
}: {
  mission: NormalizedMission;
  onSubmit: (result: SubmissionResult) => void;
}) {
  const [selected, setSelected] = useState("");

  const check = () => {
    const choice = mission.choices.find((item) => item.id === selected);
    const correct = Boolean(choice?.correct);
    onSubmit({
      score: correct ? 100 : 0,
      correct,
      feedback: correct
        ? "Correct — well done."
        : "That answer is not correct yet. Try another option.",
    });
  };

  return (
    <div className="learning-activity">
      {mission.passage ? (
        <div className="learning-passage">{mission.passage}</div>
      ) : null}
      <h2>{mission.prompt}</h2>
      <div className="learning-options">
        {mission.choices.map((choice) => (
          <button
            type="button"
            key={choice.id}
            className={selected === choice.id ? "is-selected" : ""}
            onClick={() => setSelected(choice.id)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="learning-primary"
        disabled={!selected}
        onClick={check}
      >
        Check answer
      </button>
    </div>
  );
}

function Listening({
  mission,
  onSubmit,
}: {
  mission: NormalizedMission;
  onSubmit: (result: SubmissionResult) => void;
}) {
  const play = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(mission.audioText);
    speech.lang = "ar";
    speech.rate = 0.85;
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="learning-audio-wrap">
      <button type="button" className="learning-listen" onClick={play}>
        ▶ Listen
      </button>
      <ChoiceActivity mission={mission} onSubmit={onSubmit} />
    </div>
  );
}

function Writing({
  mission,
  onSubmit,
}: {
  mission: NormalizedMission;
  onSubmit: (result: SubmissionResult) => void;
}) {
  const [answer, setAnswer] = useState("");
  return (
    <div className="learning-activity">
      {mission.passage ? (
        <div className="learning-passage">{mission.passage}</div>
      ) : null}
      <h2>{mission.prompt}</h2>
      <textarea
        rows={6}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="Write your answer here…"
      />
      <button
        type="button"
        className="learning-primary"
        disabled={!answer.trim()}
        onClick={() => onSubmit(assessText(mission, answer))}
      >
        Submit answer
      </button>
    </div>
  );
}

function Ordering({
  mission,
  onSubmit,
}: {
  mission: NormalizedMission;
  onSubmit: (result: SubmissionResult) => void;
}) {
  const initial = useMemo(
    () => [...mission.tokens].reverse(),
    [mission.tokens],
  );
  const [available, setAvailable] = useState(initial);
  const [answer, setAnswer] = useState<string[]>([]);

  const add = (word: string, index: number) => {
    setAvailable((items) => items.filter((_, i) => i !== index));
    setAnswer((items) => [...items, word]);
  };

  const remove = (word: string, index: number) => {
    setAnswer((items) => items.filter((_, i) => i !== index));
    setAvailable((items) => [...items, word]);
  };

  return (
    <div className="learning-activity">
      <h2>{mission.prompt}</h2>
      <div className="learning-answer-zone">
        {answer.length === 0 ? <span>Build the sentence here</span> : null}
        {answer.map((word, index) => (
          <button
            type="button"
            key={`${word}-${index}`}
            onClick={() => remove(word, index)}
          >
            {word}
          </button>
        ))}
      </div>
      <div className="learning-token-bank">
        {available.map((word, index) => (
          <button
            type="button"
            key={`${word}-${index}`}
            onClick={() => add(word, index)}
          >
            {word}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="learning-primary"
        disabled={answer.length !== mission.tokens.length}
        onClick={() =>
          onSubmit(
            assessText(
              {
                ...mission,
                expectedAnswer:
                  mission.expectedAnswer || mission.tokens.join(" "),
              },
              answer.join(" "),
            ),
          )
        }
      >
        Check order
      </button>
    </div>
  );
}

function Recording({
  mission,
  onSubmit,
  pronunciation,
}: {
  mission: NormalizedMission;
  onSubmit: (result: SubmissionResult) => void;
  pronunciation: boolean;
}) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");

  const playModel = () => {
    if (!("speechSynthesis" in window)) return;
    const speech = new SpeechSynthesisUtterance(
      mission.audioText || mission.expectedAnswer || mission.prompt,
    );
    speech.lang = "ar";
    speech.rate = 0.8;
    window.speechSynthesis.speak(speech);
  };

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((track) => track.stop());
      trackLearningEvent(mission, "recorded");
    };
    recorder.start();
    setRecording(true);
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="learning-activity">
      <h2>{mission.prompt}</h2>
      {pronunciation ? (
        <button type="button" className="learning-listen" onClick={playModel}>
          ▶ Hear model pronunciation
        </button>
      ) : null}
      <div className="learning-recorder">
        <button type="button" onClick={recording ? stop : start}>
          {recording ? "■ Stop recording" : "● Start recording"}
        </button>
        {audioUrl ? <audio controls src={audioUrl} /> : null}
      </div>
      <button
        type="button"
        className="learning-primary"
        disabled={!audioUrl}
        onClick={() =>
          onSubmit({
            score: 100,
            correct: true,
            feedback: pronunciation
              ? "Recording saved. AI pronunciation scoring will connect here next."
              : "Your speaking response has been recorded successfully.",
          })
        }
      >
        Save recording
      </button>
    </div>
  );
}
