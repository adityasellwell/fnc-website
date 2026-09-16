import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminAuth } from "@/lib/firebase/admin";
import { checkPhoneLoginRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 5;

function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.length === 10 ? digits : null;
}

/**
 * Verifies the code from ../send/route.js, then bridges into a real
 * Firebase identity via a custom token — the client exchanges this for an
 * idToken with signInWithCustomToken() and hands it to the existing
 * /api/auth/session endpoint unchanged. No Firebase phone-auth call is
 * ever made, so there's no reCAPTCHA and no Blaze billing requirement.
 */
export async function POST(request) {
  const ip = getClientIp(request);

  try {
    const { phone: rawPhone, code } = await request.json();
    const phone = normalizePhone(rawPhone);
    const submittedCode = String(code || "").trim();
    if (!phone || submittedCode.length !== 6) {
      return NextResponse.json({ error: "Invalid phone or OTP." }, { status: 400 });
    }

    const limitRes = await checkPhoneLoginRateLimit({ phone, ip });
    if (!limitRes.success) return rateLimitResponse("Too many attempts. Please try again later.");

    const otpRow = await db.phoneOtp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRow || otpRow.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 401 });
    }
    if (otpRow.attempts >= MAX_ATTEMPTS) {
      await db.phoneOtp.delete({ where: { id: otpRow.id } });
      return NextResponse.json({ error: "Too many incorrect attempts. Please request a new OTP." }, { status: 401 });
    }
    if (otpRow.code !== submittedCode) {
      await db.phoneOtp.update({ where: { id: otpRow.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ error: "Incorrect OTP. Please try again." }, { status: 401 });
    }

    // Correct — this code is now spent, win or lose from here on.
    await db.phoneOtp.delete({ where: { id: otpRow.id } });

    const phoneNumber = `+91${phone}`;
    let uid;
    try {
      const existing = await adminAuth.getUserByPhoneNumber(phoneNumber);
      uid = existing.uid;
    } catch (err) {
      if (err?.code !== "auth/user-not-found") throw err;
      const created = await adminAuth.createUser({ phoneNumber });
      uid = created.uid;
    }

    const customToken = await adminAuth.createCustomToken(uid);
    return NextResponse.json({ success: true, customToken });
  } catch (err) {
    console.error("[POST /api/auth/phone-otp/verify] failed:", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
