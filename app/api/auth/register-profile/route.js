import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Saves the phone number collected at sign-up. Firebase's own
 * `user.phoneNumber` field only gets set by its real Phone-Auth (OTP)
 * flow — `updateProfile()` doesn't accept it at all — so a phone number
 * typed into a plain form field during email/password sign-up has nowhere
 * to land unless we save it ourselves. Called right after account
 * creation, before the verification email / sign-out, using the fresh
 * idToken to identify which Firebase user this belongs to.
 */
export async function POST(request) {
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.success) return rateLimitResponse();

  try {
    const { idToken, phone, name } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Save profile data (phone, name) in custom claims instead of creating DB row now.
    // This complies with: "Only create a new Customer after the user's email has been verified."
    await adminAuth.setCustomUserClaims(decoded.uid, { phone, name });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/register-profile] failed:", err);
    return NextResponse.json({ error: "Could not save profile details." }, { status: 500 });
  }
}
