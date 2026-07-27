import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Franchise application leads.
 *
 * Backs the `/franchise/apply` page — a public form, so no `customerId` /
 * auth concept applies here (unlike cart/orders).
 */

const createLeadSchema = z.object({
  name: z.string().min(1, "name is required").max(200),
  email: z.string().email("A valid email is required"),
  phone: z.string().min(7, "A valid phone number is required").max(20),
  city: z.string().min(1, "city is required").max(200),
  investmentBudget: z.string().min(1, "investmentBudget is required"),
  message: z.string().max(5000).optional(),
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

  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, email, phone, city, investmentBudget, message } = parsed.data;

  try {
    const lead = await db.franchiseLead.create({
      data: {
        name,
        email,
        phone,
        city,
        investmentBudget,
        message: message ?? null,
      },
    });

    return NextResponse.json(
      {
        data: lead,
        message: "Franchise application submitted successfully.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/franchise-leads] failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
