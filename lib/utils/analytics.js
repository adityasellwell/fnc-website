import { headers } from "next/headers";
import { getSessionClaims } from "@/lib/auth-jwt";
import { db } from "@/lib/db";

/**
 * Parses user agent string to extract device category and browser type.
 * Runs dependency-free to ensure high performance.
 */
export function parseUserAgent(uaString) {
  if (!uaString) return { browser: "Unknown", device: "Desktop" };

  let device = "Desktop";
  const ua = uaString.toLowerCase();
  
  if (/ipad|tablet|playbook|silk/i.test(ua)) {
    device = "Tablet";
  } else if (/mobile|android|iphone|ipod|phone|iemobile/i.test(ua)) {
    device = "Mobile";
  }

  let browser = "Other";
  if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  } else if (/edge|edg/i.test(ua)) {
    browser = "Edge";
  } else if (/opr/i.test(ua)) {
    browser = "Opera";
  } else if (/chrome|crios/i.test(ua)) {
    browser = "Chrome";
  } else if (/safari/i.test(ua)) {
    browser = "Safari";
  }

  return { browser, device };
}

/**
 * Logs a product search — shared by /api/products (external/API callers)
 * and /shop (the real storefront search, wired to the Navbar search bar).
 * Fire-and-forget: a logging failure must never break the search itself,
 * so callers should not await this (or if they do, errors are swallowed).
 * Works in both Route Handlers and Server Components — `headers()` and
 * Clerk's `auth()` are both available in either context in the App Router.
 */
export async function logProductSearch({ query, results }) {
  try {
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      null;
    const { browser, device } = parseUserAgent(headerList.get("user-agent") || "");
    const claims = await getSessionClaims();
    const userId = claims?.uid || null;

    await db.searchLog.create({
      data: { query, results, userId, device, browser, ipAddress: ip },
    });
  } catch (err) {
    console.error("[SearchLog] write failed:", err);
  }
}
