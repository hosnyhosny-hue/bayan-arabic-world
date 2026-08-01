import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
function need(name: string): string { const value = process.env[name]?.trim(); if (!value) throw new Error(`Missing ${name}`); return value; }
export function bayanAdmin() { return getApps()[0] ?? initializeApp({ credential: cert({ projectId: need("FIREBASE_ADMIN_PROJECT_ID"), clientEmail: need("FIREBASE_ADMIN_CLIENT_EMAIL"), privateKey: need("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n") }) }); }
export const bayanDb = () => getFirestore(bayanAdmin());

/**
 * Compatibility accessor used by BAYAN analytics API routes.
 */
export function getBayanFirestore() {
  return bayanDb();
}

