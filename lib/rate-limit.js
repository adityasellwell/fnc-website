import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

/**
 * Shared IP-based rate limiter for mutating (POST/PATCH) API routes.
 *
 * Upstash isn't provisioned in this environment yet (UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN are unset placeholders), so `checkRateLimit` is a
 * safe no-op until those are configured — routes must keep working today
 * without Upstash. Once Upstash is provisioned, this activates automatically
 * with no call-site changes required.
 */
const isConfigured = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
);

const ratelimit = isConfigured
  ? new Ratelimit({
      redis: new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      }),
      // 10 requests per 10 seconds per IP — generous enough for normal use,
      // tight enough to blunt naive scripted abuse of write endpoints.
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: false,
      prefix: "fc-website/ratelimit",
    })
  : null;

function getClientIp(request) {
  // Standard proxy headers (Vercel, most reverse proxies). Fall back to a
  // shared bucket if neither is present rather than throwing.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

/**
 * Checks whether the request's IP is within the rate limit.
 *
 * Always resolves — never throws. When Upstash isn't configured, or if the
 * Upstash call itself fails, this fails OPEN (returns success: true) so a
 * missing/broken rate limiter never takes an endpoint down.
 *
 * @param {Request} request
 * @returns {Promise<{ success: boolean }>}
 */
export async function checkRateLimit(request) {
  if (!ratelimit) return { success: true };

  try {
    const ip = getClientIp(request);
    const { success } = await ratelimit.limit(ip);
    return { success };
  } catch (err) {
    console.error("[rate-limit] check failed, allowing request:", err);
    return { success: true };
  }
}

/**
 * Standard 429 JSON response for when checkRateLimit() reports failure.
 */
export function rateLimitResponse() {
  return Response.json(
    { error: "Too many requests. Please try again shortly." },
    { status: 429 }
  );
}
