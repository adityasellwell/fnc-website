import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { checkPhoneLoginRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { recordApiLog } from "@/lib/logger";

const OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL for generous expiration window
const REUSE_WINDOW_MS = 3 * 60 * 1000; // 3 minutes reuse window so re-sends use the same code

function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.length === 10 ? digits : null;
}

export async function POST(request) {
  const startTime = Date.now();
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "";
  const route = "/api/auth/phone-otp/send";

  try {
    const { phone: rawPhone } = await request.json();
    const phone = normalizePhone(rawPhone);
    if (!phone) {
      recordApiLog({ route, method: "POST", statusCode: 400, durationMs: Date.now() - startTime, ip, userAgent, error: "Invalid phone number", details: { phone: rawPhone } });
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }

    const limitRes = await checkPhoneLoginRateLimit({ phone, ip });
    if (!limitRes.success) {
      recordApiLog({ route, method: "POST", statusCode: 429, durationMs: Date.now() - startTime, ip, userAgent, error: "Rate limit exceeded", details: { phone } });
      return rateLimitResponse("Too many OTP requests. Please try again in a few minutes.");
    }

    // Check if there is an active OTP for this phone created in the last 3 minutes
    const existingOtp = await db.phoneOtp.findFirst({
      where: { phone, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    let code;
    const now = Date.now();
    if (existingOtp && (now - new Date(existingOtp.createdAt).getTime()) < REUSE_WINDOW_MS) {
      // Reuse existing active code so late-delivered SMS still matches!
      code = existingOtp.code;
    } else {
      // Generate a fresh 6-digit code
      code = String(Math.floor(100000 + Math.random() * 900000));
      await db.phoneOtp.deleteMany({ where: { phone } });
      await db.phoneOtp.create({
        data: { phone, code, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
      });
    }

    const result = await sendSms("OTP_VERIFICATION", phone, { otp: code });
    if (!result.success) {
      recordApiLog({ route, method: "POST", statusCode: 502, durationMs: Date.now() - startTime, ip, userAgent, error: "SMS Gateway Dispatch Failed", details: { phone, smsError: result.error } });
      return NextResponse.json({ error: "Failed to send OTP via SMS. Please check your network and try again." }, { status: 502 });
    }

    recordApiLog({ route, method: "POST", statusCode: 200, durationMs: Date.now() - startTime, ip, userAgent, details: { phone, smsResult: result.data } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/phone-otp/send] failed:", err);
    recordApiLog({ route, method: "POST", statusCode: 500, durationMs: Date.now() - startTime, ip, userAgent, error: err?.message || String(err) });
    return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
  }
}
