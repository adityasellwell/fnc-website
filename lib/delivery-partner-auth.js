import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE_NAME = "fnc_partner_session";
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

// Falls back to a random per-process secret when the env var isn't set —
// fine for local dev (sessions just invalidate on restart); production
// should always set DELIVERY_PARTNER_SESSION_SECRET explicitly.
const fallbackSecret = crypto.randomBytes(32).toString("hex");
function getSecret() {
  return process.env.DELIVERY_PARTNER_SESSION_SECRET || fallbackSecret;
}

/** Random 4-digit PIN, issued by admin when creating a partner. */
export function generatePin() {
  return String(crypto.randomInt(1000, 10000));
}

export function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pin, salt, 64).toString("hex");
  return { pinHash: hash, pinSalt: salt };
}

export function verifyPin(pin, pinHash, pinSalt) {
  const hash = crypto.scryptSync(pin, pinSalt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(pinHash, "hex"));
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function unsign(token) {
  const [body, sig] = (token || "").split(".");
  if (!body || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  if (sig.length !== expectedSig.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createPartnerSession(partnerId) {
  const token = sign({ partnerId, exp: Date.now() + SESSION_DURATION_MS });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    maxAge: SESSION_DURATION_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function destroyPartnerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Resolves the signed-in delivery partner's row, or null. */
export async function getCurrentPartner() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = unsign(token);
  if (!payload?.partnerId) return null;

  const partner = await db.deliveryPartner.findUnique({ where: { id: payload.partnerId } });
  if (!partner || !partner.isActive) return null;
  return partner;
}
