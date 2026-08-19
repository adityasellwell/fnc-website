"use server";

import { db } from "@/lib/db";

/**
 * Client-side preview only — the real, authoritative discount calculation
 * and usage-limit increment happen in /api/orders at order-creation time.
 * This just lets the checkout UI show "code applied, -₹X" before the
 * shopper submits, without duplicating that logic two different ways.
 *
 * `items` is the cart's [{ productId, qty }], used to scope the discount
 * to only the products/category the promotion actually targets — this
 * previously always discounted the full subtotal regardless of scope,
 * so a coupon meant for one product discounted the whole cart.
 */
export async function validatePromoCodeAction(code, subtotal, items = []) {
  const trimmed = code?.toString().trim().toUpperCase();
  if (!trimmed) return { ok: false, error: "Enter a code." };

  const promo = await db.promotion.findUnique({
    where: { code: trimmed },
    include: { scopeProducts: { select: { id: true } } },
  });
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

  // Re-derive line totals from real DB prices (never trust a client-passed
  // subtotal per item) so the scoped amount can't be spoofed either.
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = productIds.length > 0
    ? await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, price: true, categoryId: true } })
    : [];
  const productById = new Map(products.map((p) => [p.id, p]));

  let discountableAmount = subtotal;
  if (promo.appliesTo === "PRODUCT") {
    const scopedIds = new Set(promo.scopeProducts.map((p) => p.id));
    discountableAmount = items.reduce((sum, item) => {
      const product = productById.get(item.productId);
      return product && scopedIds.has(item.productId) ? sum + Number(product.price) * item.qty : sum;
    }, 0);
  } else if (promo.appliesTo === "CATEGORY" && promo.scopeCategoryId) {
    discountableAmount = items.reduce((sum, item) => {
      const product = productById.get(item.productId);
      return product?.categoryId === promo.scopeCategoryId ? sum + Number(product.price) * item.qty : sum;
    }, 0);
  }

  if ((promo.appliesTo === "PRODUCT" || promo.appliesTo === "CATEGORY") && discountableAmount === 0) {
    return { ok: false, error: "This coupon doesn't apply to any items in your cart." };
  }

  const discount =
    promo.discountType === "PERCENT"
      ? discountableAmount * (Number(promo.value) / 100)
      : promo.discountType === "FLAT"
      ? Number(promo.value)
      : 0;

  return { ok: true, code: trimmed, discount: Math.min(discount, discountableAmount), title: promo.title };
}
