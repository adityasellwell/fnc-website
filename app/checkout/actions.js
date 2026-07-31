"use server";

import { db } from "@/lib/db";

/**
 * Client-side preview only — the real, authoritative discount calculation
 * and usage-limit increment happen in /api/orders at order-creation time.
 * This just lets the checkout UI show "code applied, -₹X" before the
 * shopper submits, without duplicating that logic two different ways.
 */
export async function validatePromoCodeAction(code, subtotal) {
  const trimmed = code?.toString().trim().toUpperCase();
  if (!trimmed) return { ok: false, error: "Enter a code." };

  const promo = await db.promotion.findUnique({ where: { code: trimmed } });
  const now = new Date();
  const isExpired = promo?.endsAt && promo.endsAt < now;
  const isNotStartedYet = promo?.startsAt && promo.startsAt > now;

  if (!promo || !promo.active || isExpired || isNotStartedYet) {
    return { ok: false, error: "Invalid or expired coupon code." };
  }
  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }
  if (promo.minOrderValue != null && subtotal < Number(promo.minOrderValue)) {
    return { ok: false, error: `Order must be at least ₹${Number(promo.minOrderValue)} for this code.` };
  }

  const discount =
    promo.discountType === "PERCENT"
      ? subtotal * (Number(promo.value) / 100)
      : promo.discountType === "FLAT"
      ? Number(promo.value)
      : 0;

  return { ok: true, code: trimmed, discount: Math.min(discount, subtotal), title: promo.title };
}
