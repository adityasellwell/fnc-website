import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { checkPhoneLoginRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const OTP_TTL_MS = 10 * 60 * 1000;

function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.length === 10 ? digits : null;
}

/**
 * Sends a login OTP via our own SMS gateway — never Firebase's phone auth,
 * which requires their paid Blaze plan and shows its own reCAPTCHA badge.
 * The verify step (see ../verify/route.js) bridges a successful code check
 * into a real Firebase session via a custom token, so every downstream
 * piece (getCurrentCustomer, /api/auth/session) stays unchanged.
 */
export async function POST(request) {
  const ip = getClientIp(request);

  try {
    const { phone: rawPhone } = await request.json();
    const phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }

    const limitRes = await checkPhoneLoginRateLimit({ phone, ip });
    if (!limitRes.success) return rateLimitResponse("Too many OTP requests. Please try again later.");

    const code = String(Math.floor(100000 + Math.random() * 900000));

    // One live OTP per phone at a time — stops a stale earlier code from
    // also being valid alongside the fresh one.
    await db.phoneOtp.deleteMany({ where: { phone } });
    await db.phoneOtp.create({
      data: { phone, code, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    });

    const result = await sendSms("OTP_VERIFICATION", phone, { otp: code });
    if (!result.success) {
      return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/phone-otp/send] failed:", err);
    return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
  }
}
