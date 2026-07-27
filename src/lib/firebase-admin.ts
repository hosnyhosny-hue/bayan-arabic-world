import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ?.trim()
  .replace(/^["']|["']$/g, "")
  .replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Firebase Admin environment variables are missing. Check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY."
  );
}

if (
  !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
  !privateKey.includes("-----END PRIVATE KEY-----")
) {
  throw new Error(
    "FIREBASE_ADMIN_PRIVATE_KEY has an invalid format."
  );
}

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
