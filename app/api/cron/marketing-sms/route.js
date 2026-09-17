import { NextResponse } from "next/server";
import { sendAbandonedCheckoutReminders, sendWinBackMessages } from "@/services/marketing";

/**
 * Hit on a schedule by Hostinger's Cron Jobs panel (hPanel → Advanced →
 * Cron Jobs) — NOT run in-process. A `setInterval` inside the Node
 * process is unreliable here: it resets on every restart/redeploy and
 * would double-fire if the app ever scales to more than one instance.
 * A plain scheduled HTTP hit avoids both problems.
 *
 * Protected by CRON_SECRET (set in Hostinger's env vars, passed as a
 * `?secret=` query param in the scheduled job's URL) — this endpoint
 * sends real SMS on every call, so it can't be left open to the public.
 */
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const provided = new URL(request.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [cartReminders, winBack] = await Promise.all([
      sendAbandonedCheckoutReminders(),
      sendWinBackMessages(),
    ]);
    return NextResponse.json({ success: true, cartReminders, winBack });
  } catch (err) {
    console.error("[GET /api/cron/marketing-sms] failed:", err);
    return NextResponse.json({ error: "Cron run failed" }, { status: 500 });
  }
}
