import type { SpeechAssessmentResult } from "./speech-assessment-types";

export async function assessLearnerSpeech(input: {
  audio: Blob;
  referenceText: string;
  locale?: string;
}): Promise<SpeechAssessmentResult> {
  const form = new FormData();
  form.set("audio", input.audio, "recording.webm");
  form.set("referenceText", input.referenceText);
  form.set("locale", input.locale ?? "ar-QA");

  const response = await fetch(
    "/api/learn/arabic-b/speech-assessment",
    { method: "POST", body: form },
  );

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
