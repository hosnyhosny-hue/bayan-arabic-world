import { NextRequest, NextResponse } from "next/server";

import {
  feedbackFromScore,
  lexicalScore,
} from "../../../../learn/arabic-b/lib/arabic-speech-evaluation";
import type { SpeechAssessmentResult } from "../../../../learn/arabic-b/lib/speech-assessment-types";

export const runtime = "nodejs";

async function azureAssessment(
  audio: File,
  referenceText: string,
  locale: string,
): Promise<SpeechAssessmentResult> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) throw new Error("Azure Speech is not configured");

  const config = Buffer.from(
    JSON.stringify({
      ReferenceText: referenceText,
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: true,
    }),
  ).toString("base64");

  const endpoint =
    `https://${region}.stt.speech.microsoft.com/` +
    `speech/recognition/conversation/cognitiveservices/v1` +
    `?language=${encodeURIComponent(locale)}&format=detailed`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Pronunciation-Assessment": config,
      "Content-Type": audio.type || "audio/webm",
      Accept: "application/json",
    },
    body: Buffer.from(await audio.arrayBuffer()),
  });

  if (!response.ok) throw new Error(await response.text());

  const data = await response.json() as {
    DisplayText?: string;
    NBest?: Array<{
      Display?: string;
      PronunciationAssessment?: {
        AccuracyScore?: number;
        FluencyScore?: number;
        CompletenessScore?: number;
        PronScore?: number;
      };
      Words?: Array<{
        Word?: string;
        PronunciationAssessment?: {
          AccuracyScore?: number;
          ErrorType?: string;
        };
      }>;
    }>;
  };

  const best = data.NBest?.[0];
  const transcript = best?.Display ?? data.DisplayText ?? "";
  const scores = best?.PronunciationAssessment;
  const overall = Math.round(
    scores?.PronScore ?? lexicalScore(transcript, referenceText),
  );

  return {
    provider: "azure",
    transcript,
    overallScore: overall,
    accuracyScore: Math.round(scores?.AccuracyScore ?? overall),
    fluencyScore: scores?.FluencyScore,
    completenessScore: scores?.CompletenessScore,
    pronunciationScore: scores?.PronScore,
    feedbackAr: feedbackFromScore(overall),
    words: best?.Words?.map((item) => ({
      word: item.Word ?? "",
      accuracy: item.PronunciationAssessment?.AccuracyScore,
      errorType: item.PronunciationAssessment?.ErrorType,
    })) ?? [],
  };
}

async function openAIAssessment(
  audio: File,
  referenceText: string,
): Promise<SpeechAssessmentResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OpenAI is not configured");

  const form = new FormData();
  form.set("file", audio, audio.name || "recording.webm");
  form.set(
    "model",
    process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe",
  );
  form.set("language", "ar");
  form.set("prompt", `Expected Arabic phrase: ${referenceText}`);

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    },
  );

  if (!response.ok) throw new Error(await response.text());
  const data = await response.json() as { text?: string };
  const transcript = data.text ?? "";
  const score = lexicalScore(transcript, referenceText);

  return {
    provider: "openai",
    transcript,
    overallScore: score,
    accuracyScore: score,
    feedbackAr: [
      ...feedbackFromScore(score),
      "الدرجة مبنية على مطابقة التفريغ النصي، وليست تقييمًا فونيميًا كاملًا.",
    ],
    words: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const audio = form.get("audio");
    const referenceText = String(form.get("referenceText") ?? "").trim();
    const locale = String(form.get("locale") ?? "ar-QA");

    if (!(audio instanceof File) || !referenceText) {
      return NextResponse.json(
        { error: "audio and referenceText are required" },
        { status: 400 },
      );
    }

    if (audio.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio exceeds 12 MB" }, { status: 413 });
    }

    if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
      return NextResponse.json(
        await azureAssessment(audio, referenceText, locale),
      );
    }

    if (process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        await openAIAssessment(audio, referenceText),
      );
    }

    return NextResponse.json(
      {
        provider: "local",
        transcript: "",
        overallScore: 0,
        accuracyScore: 0,
        feedbackAr: [
          "أضف مفاتيح Azure Speech أو OpenAI إلى .env.local.",
        ],
        words: [],
      } satisfies SpeechAssessmentResult,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assessment failed" },
      { status: 500 },
    );
  }
}
