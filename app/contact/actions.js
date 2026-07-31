"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

export async function submitContactMessageAction(values) {
  const rateLimit = await checkRateLimit({ headers: await headers() });
  if (!rateLimit.success) {
    return { ok: false, error: "Too many requests. Please try again in a moment." };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: "Please fill in all required fields correctly." };
  }

  await db.contactMessage.create({ data: parsed.data });
  return { ok: true };
}
