import { z } from "zod";

/**
 * Validates process.env once at module load. Fails fast with a clear,
 * aggregated error instead of a cryptic runtime crash deep in some
 * unrelated code path the first time a missing var is actually read.
 *
 * Vars for integrations not wired yet (Clerk/Razorpay/Upstash/Resend/
 * Sentry — Phases 6/7+) are `.optional()` for now so the app can run
 * through Phases 1-5 without those credentials. As each integration's
 * phase lands, tighten its vars here to `.min(1)` so a missing key at
 * that point fails loudly instead of silently no-op'ing.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  INITIAL_ADMIN_EMAIL: z.string().email().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment variables — check .env.local against .env.example:\n${issues}`
  );
}

export const env = parsed.data;
