import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

let app;
let adminAuthInstance = null;
let adminStorageBucketInstance = null;

function getAdminAuth() {
  if (adminAuthInstance) return adminAuthInstance;

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined;

    // Check if we are in build environment with placeholders
    const isMock = !projectId || !clientEmail || !privateKey || privateKey.includes("PLACEHOLDER");

    if (isMock) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("[Firebase Admin] FIREBASE credentials are missing or placeholders in production. Failing fast.");
      }
      console.warn("[Firebase Admin] Running with mock credentials (build phase / placeholder).");
      return {
        createSessionCookie: async () => "mock_session_cookie",
        verifySessionCookie: async () => ({
          uid: "mock_uid",
          email: "mock@example.com",
          email_verified: true,
          firebase: { sign_in_provider: "google.com" }
        }),
        verifyIdToken: async () => ({ uid: "mock_uid", email: "mock@example.com" }),
        setCustomUserClaims: async () => {},
      };
    }

    try {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      adminAuthInstance = getAuth(app);
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
      console.error("[Firebase Admin] Initialization failed, using mock auth.", error);
      return {
        createSessionCookie: async () => "mock_session_cookie",
        verifySessionCookie: async () => ({
          uid: "mock_uid",
          email: "mock@example.com",
          email_verified: true,
          firebase: { sign_in_provider: "google.com" }
        }),
        verifyIdToken: async () => ({ uid: "mock_uid", email: "mock@example.com" }),
        setCustomUserClaims: async () => {},
      };
    }
  } else {
    app = getApp();
    adminAuthInstance = getAuth(app);
  }

  return adminAuthInstance;
}

// Export a proxy object to match existing syntax without breaking build evaluation
export const adminAuth = {
  createSessionCookie: (...args) => getAdminAuth().createSessionCookie(...args),
  verifySessionCookie: (...args) => getAdminAuth().verifySessionCookie(...args),
  verifyIdToken: (...args) => getAdminAuth().verifyIdToken(...args),
  setCustomUserClaims: (...args) => getAdminAuth().setCustomUserClaims(...args),
};

/**
 * Uploads a buffer to Firebase Storage via the Admin SDK (bypasses Storage
 * security rules entirely — authorization for who may call this happens
 * one layer up, via requireAdminUser() in the API route, not via Storage
 * rules). Makes the file publicly readable and returns its public URL,
 * matching the plain-URL-string shape every image field already expects
 * (Product.images, Category.image, Banner.image, Store.images) — no
 * schema changes needed to support real uploads.
 */
export async function uploadToStorage(buffer, path, contentType) {
  getAdminAuth(); // ensures the app is initialized first
  if (adminStorageBucketInstance === null) {
    adminStorageBucketInstance = getStorage(app).bucket();
  }
  const file = adminStorageBucketInstance.file(path);
  await file.save(buffer, { metadata: { contentType }, public: true });
  return `https://storage.googleapis.com/${adminStorageBucketInstance.name}/${path}`;
}

export default app;
