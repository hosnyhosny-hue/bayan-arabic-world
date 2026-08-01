import admin from "firebase-admin";

const [email, password = "ChangeMe123!"] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node scripts/seed-super-admin.mjs admin@example.com 'StrongPassword'");
  process.exit(1);
}

const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
admin.initializeApp({ credential: admin.credential.cert({
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: key,
}) });
const auth = admin.auth();
const db = admin.firestore();
let user;
try { user = await auth.getUserByEmail(email); }
catch { user = await auth.createUser({ email, password, displayName: "BAYAN Super Admin", emailVerified: true }); }
await auth.setCustomUserClaims(user.uid, { role: "super_admin", schoolId: process.env.BAYAN_DEFAULT_SCHOOL_ID || "kcd" });
await db.collection("bayan_users").doc(user.uid).set({
  email, displayName: user.displayName || "BAYAN Super Admin", role: "super_admin", status: "active",
  locale: "ar", schoolId: process.env.BAYAN_DEFAULT_SCHOOL_ID || "kcd", permissions: [],
  createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(),
}, { merge: true });
console.log(`Super admin ready: ${email} (${user.uid})`);
