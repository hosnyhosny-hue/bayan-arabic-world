import { FieldValue } from "firebase-admin/firestore";
import type { BayanStudioProject } from "./bayan-studio-schema";
import { bayanDb } from "./bayan-platform-admin";
const C = "bayanPlatform";
export async function readDraft() { const s = await bayanDb().collection(C).doc("draft").get(); return s.exists ? s.data()?.project as BayanStudioProject : null; }
export async function saveDraft(project: BayanStudioProject) { await bayanDb().collection(C).doc("draft").set({ project, updatedAt: FieldValue.serverTimestamp() }, { merge: true }); }
export async function publishProject(project: BayanStudioProject) { const db=bayanDb(); const r=db.collection("bayanPlatformReleases").doc(); await db.runTransaction(async t=>{ t.set(r,{project,createdAt:FieldValue.serverTimestamp()}); t.set(db.collection(C).doc("published"),{project,releaseId:r.id,publishedAt:FieldValue.serverTimestamp()},{merge:true});}); return r.id; }
export async function readPublished() { const s=await bayanDb().collection(C).doc("published").get(); return s.exists ? s.data() : null; }
