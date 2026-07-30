import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "fnc_session";
const SESSION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Creates a Firebase session cookie from an ID token and sets it in headers.
 */
export async function createSession(idToken) {
  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_DURATION / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return sessionCookie;
  } catch (error) {
    console.error("[Session] Error creating session cookie:", error);
    throw error;
  }
}

/**
 * Verifies the Firebase session cookie. Returns the decoded claims, or null if invalid/expired.
 */
export async function getSessionClaims() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;

    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    // Session cookie expired or revoked
    return null;
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (sessionCookie) {
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        if (decodedClaims && decodedClaims.uid) {
          await adminAuth.revokeRefreshTokens(decodedClaims.uid);
          console.log(`[Session] Revoked refresh tokens for Firebase UID: ${decodedClaims.uid}`);
        }
      } catch (err) {
        // If session is already expired or invalid, ignore revocation error
      }
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error("[Session] Error destroying session:", error);
  }
}
