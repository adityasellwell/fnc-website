import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

let app;
let adminAuthInstance = null;
let adminStorageBucketInstance = null;

/**
 * Hosting panels (Hostinger's env-var UI included) are inconsistent about
 * how they store a multi-line PEM key — some keep real newlines, some
 * collapse them to literal "\n", some mangle backslashes/quotes in a plain
 * text-input field entirely. Rather than keep guessing at that field's
 * quirks, FIREBASE_PRIVATE_KEY_BASE64 (the whole PEM, base64-encoded) is
 * the preferred source: base64 has no newlines, quotes, or backslashes,
 * so no panel can mangle it. FIREBASE_PRIVATE_KEY (raw PEM) is kept as a
 * fallback for environments where the raw form already works (e.g. this
 * local .env.local).
 */
function normalizePrivateKey(raw) {
  if (!raw) return undefined;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
}

function resolvePrivateKey() {
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    return Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64.trim(), "base64").toString("utf8");
  }
  return normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
}

function getAdminAuth() {
  if (adminAuthInstance) return adminAuthInstance;

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = resolvePrivateKey();

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

// Export a proxy object to match existing syntax and support all Firebase Admin Auth methods dynamically
export const adminAuth = new Proxy({}, {
  get(target, prop) {
    const authService = getAdminAuth();
    if (typeof authService[prop] === "function") {
      return authService[prop].bind(authService);
    }
    return authService[prop];
  }
});

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
