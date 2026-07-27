import { z } from "zod";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Newsletter signup.
 *
 * There is no Newsletter/Subscriber model in the Prisma schema yet, so this
 * route does NOT persist anything durable — it validates the email and
 * logs it server-side only.
 *
 * TODO: persist to a Subscriber model once one exists, or wire to Resend's
 * audience API (RESEND_API_KEY is already reserved in lib/env.js for when
 * that phase lands).
 */

const subscribeSchema = z.object({
  email: z.string().email("A valid email is required"),
});

export async function POST(request) {
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.success) return rateLimitResponse();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  try {
    // TODO: persist to a Subscriber model once one exists, or wire to
    // Resend's audience API. For now this is intentionally NOT durable —
    // logged only, so it's honest about what actually happens today.
    console.log(`[newsletter] signup received for ${email}`);

    return NextResponse.json({
      data: { email },
      message: "Thanks for subscribing.",
    });
  } catch (err) {
    console.error("[POST /api/newsletter] failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
