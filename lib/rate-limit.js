import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

/**
 * Rate limiting with two tiers:
 *  - Upstash (Redis), used automatically once UPSTASH_REDIS_REST_URL/TOKEN
 *    are configured — durable, works across multiple server instances.
 *  - An in-memory fallback, active right now since Upstash isn't
 *    provisioned. Resets on server restart and doesn't share state across
 *    multiple instances, but this app runs as a single Node process, so
 *    it's real protection today rather than the previous pure no-op.
 *
 * Both tiers fail OPEN on any internal error — a broken limiter must never
 * take an endpoint down.
 */
const isConfigured = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
);

const redis = isConfigured
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
  : null;

function makeUpstashLimiter(limit, window, prefix) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: false,
    prefix: `fc-website/ratelimit/${prefix}`,
  });
}

// --- In-memory fallback ----------------------------------------------
const memoryStore = new Map(); // key -> { count, resetAt }

function memoryLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

// Periodic sweep so the map never grows unbounded on a long-running process.
if (typeof setInterval !== "undefined") {
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
      if (now > entry.resetAt) memoryStore.delete(key);
    }
  }, 5 * 60 * 1000);
  sweep.unref?.();
}

export function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// --- General mutating-endpoint limiter (orders, reviews, contact, etc.) --
const generalLimiter = makeUpstashLimiter(20, "10 s", "general");

/**
 * @param {Request} request
 * @returns {Promise<{ success: boolean }>}
 */
export async function checkRateLimit(request) {
  try {
    const ip = getClientIp(request);
    if (generalLimiter) {
      const { success } = await generalLimiter.limit(ip);
      return { success };
    }
    return { success: memoryLimit(`general:${ip}`, 20, 10 * 1000) };
  } catch (err) {
    console.error("[rate-limit] general check failed, allowing request:", err);
    return { success: true };
  }
}

// --- Delivery partner PIN login — the most brute-forceable surface on
// the site (4-digit PIN = 10,000 combinations). Limited per-phone (stops
// guessing one rider's PIN) AND per-IP (stops cycling through many
// phone numbers from one source). ------------------------------------
const pinPhoneLimiter = makeUpstashLimiter(8, "15 m", "pin-phone");
const pinIpLimiter = makeUpstashLimiter(30, "60 m", "pin-ip");

/**
 * @param {{ phone: string, ip: string }} params
 * @returns {Promise<{ success: boolean }>}
 */
export async function checkPinLoginRateLimit({ phone, ip }) {
  try {
    const phoneOk = pinPhoneLimiter
      ? (await pinPhoneLimiter.limit(phone)).success
      : memoryLimit(`pin-phone:${phone}`, 8, 15 * 60 * 1000);
    const ipOk = pinIpLimiter
      ? (await pinIpLimiter.limit(ip)).success
      : memoryLimit(`pin-ip:${ip}`, 30, 60 * 60 * 1000);
    return { success: phoneOk && ipOk };
  } catch (err) {
    console.error("[rate-limit] pin-login check failed, allowing request:", err);
    return { success: true };
  }
}

// --- Delivery handoff OTP — rider is already authenticated, so blast
// radius is limited to one order, but a 4-digit code still shouldn't be
// unlimited-guessable. --------------------------------------------------
const otpLimiter = makeUpstashLimiter(8, "15 m", "delivery-otp");

/**
 * @param {string} orderId
 * @returns {Promise<{ success: boolean }>}
 */
export async function checkDeliveryOtpRateLimit(orderId) {
  try {
    if (otpLimiter) {
      const { success } = await otpLimiter.limit(orderId);
      return { success };
    }
    return { success: memoryLimit(`otp:${orderId}`, 8, 15 * 60 * 1000) };
  } catch (err) {
    console.error("[rate-limit] delivery-otp check failed, allowing request:", err);
    return { success: true };
  }
}

// --- Admin/customer session creation — Firebase already throttles the
// actual sign-in attempt, this is just a backstop on our own endpoint. --
const sessionLimiter = makeUpstashLimiter(20, "10 m", "session");

/**
 * @param {string} ip
 * @returns {Promise<{ success: boolean }>}
 */
export async function checkSessionRateLimit(ip) {
  try {
    if (sessionLimiter) {
      const { success } = await sessionLimiter.limit(ip);
      return { success };
    }
    return { success: memoryLimit(`session:${ip}`, 20, 10 * 60 * 1000) };
  } catch (err) {
    console.error("[rate-limit] session check failed, allowing request:", err);
    return { success: true };
  }
}

/**
 * Standard 429 JSON response for when a check*RateLimit() reports failure.
 */
export function rateLimitResponse(message = "Too many requests. Please try again shortly.") {
  return Response.json({ error: message }, { status: 429 });
}
