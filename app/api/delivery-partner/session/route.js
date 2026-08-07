import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkPinLoginRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { verifyPin, createPartnerSession, destroyPartnerSession } from "@/lib/delivery-partner-auth";

const schema = z.object({
  phone: z.string().trim().min(10).max(15),
  pin: z.string().trim().length(4),
});

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your phone number and 4-digit PIN." }, { status: 400 });
  }

  const { phone, pin } = parsed.data;

  // Checked per-phone (stops guessing one rider's PIN) AND per-IP (stops
  // cycling through many phone numbers from one source) — a 4-digit PIN
  // is only 10,000 combinations, this is the most brute-forceable login
  // on the site.
  const limitRes = await checkPinLoginRateLimit({ phone, ip: getClientIp(request) });
  if (!limitRes.success) return rateLimitResponse("Too many sign-in attempts. Please try again in a few minutes.");

  const partner = await db.deliveryPartner.findUnique({ where: { phone } });
  if (!partner || !partner.isActive || !verifyPin(pin, partner.pinHash, partner.pinSalt)) {
    return NextResponse.json({ error: "Invalid phone number or PIN." }, { status: 401 });
  }

  await createPartnerSession(partner.id);
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await destroyPartnerSession();
  return NextResponse.json({ success: true });
}
