import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getAdminApp(): App | null {
  if (getApps().length > 0) return getApps()[0];

  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not set — admin SDK unavailable");
    return null;
  }

  try {
    const serviceAccount = JSON.parse(key);
    return initializeApp({ credential: cert(serviceAccount) });
  } catch (err) {
    console.error("Failed to initialize Firebase Admin:", err);
    return null;
  }
}

const adminApp = getAdminApp();

export const adminDb = adminApp ? getFirestore(adminApp) : null;
export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminStorage = adminApp ? getStorage(adminApp) : null;

export default adminApp;
