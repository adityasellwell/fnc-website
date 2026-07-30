import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app;
let adminAuthInstance = null;

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
      };
    }

    try {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
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
};

export default app;
