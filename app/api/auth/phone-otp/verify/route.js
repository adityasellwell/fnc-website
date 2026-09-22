import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminAuth } from "@/lib/firebase/admin";
import { checkPhoneOtpVerifyRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 5;

function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.length === 10 ? digits : null;
}

export async function POST(request) {
  const ip = getClientIp(request);

  try {
    const { phone: rawPhone, code } = await request.json();
    const phone = normalizePhone(rawPhone);
    const submittedCode = String(code || "").trim();
    if (!phone || submittedCode.length !== 6) {
      return NextResponse.json({ error: "Please enter a valid 6-digit OTP." }, { status: 400 });
    }

    const limitRes = await checkPhoneOtpVerifyRateLimit({ phone, ip });
    if (!limitRes.success) return rateLimitResponse("Too many verification attempts. Please try again later.");

    const otpRow = await db.phoneOtp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRow || new Date(otpRow.expiresAt) < new Date()) {
      return NextResponse.json({ error: "OTP expired. Please click 'Resend OTP' to get a new code." }, { status: 401 });
    }
    if (otpRow.attempts >= MAX_ATTEMPTS) {
      await db.phoneOtp.delete({ where: { id: otpRow.id } });
      return NextResponse.json({ error: "Too many incorrect attempts. Please request a new OTP." }, { status: 401 });
    }
    if (otpRow.code !== submittedCode) {
      await db.phoneOtp.update({ where: { id: otpRow.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ error: "Incorrect OTP. Please check the code received via SMS and try again." }, { status: 401 });
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
