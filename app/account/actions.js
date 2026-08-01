"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCustomer } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").nullable().or(z.literal("")),
  phone: z.string().nullable().or(z.literal("")),
});

export async function updateProfileAction(prevState, formData) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return { ok: false, error: "Not authenticated" };
    }

    const name = formData.get("name");
    const emailRaw = formData.get("email");
    const phoneRaw = formData.get("phone");

    const email = emailRaw ? emailRaw.trim() : null;
    const phone = phoneRaw ? phoneRaw.trim() : null;

    const validated = profileSchema.parse({ name, email, phone });

    // Validate email uniqueness if changed
    if (validated.email && validated.email !== customer.email) {
      const existing = await db.customer.findUnique({
        where: { email: validated.email },
      });
      if (existing) {
        return { ok: false, error: "This email is already linked to another account." };
      }
    }

    await db.customer.update({
      where: { id: customer.id },
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
      },
    });

    revalidatePath("/account");
    return { ok: true, success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, error: err.errors[0].message };
    }
    return { ok: false, error: err.message || "Failed to update profile" };
  }
}
