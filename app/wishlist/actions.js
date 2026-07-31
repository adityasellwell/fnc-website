"use server";

import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";

/**
 * DB-backed wishlist for signed-in customers, so it follows them across
 * devices — guests keep using the existing localStorage-only Zustand store
 * (lib/store/wishlist.js), which stays the only wishlist mechanism until
 * someone signs in.
 */
export async function getWishlistAction() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const items = await db.wishlist.findMany({
    where: { customerId: customer.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return items.map((w) => ({
    productId: w.productId,
    slug: w.product.slug,
    name: w.product.name,
    unit: w.product.unit,
    price: Number(w.product.price),
    image: Array.isArray(w.product.images) ? w.product.images[0] : null,
  }));
}

export async function toggleWishlistAction(productId) {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, reason: "NOT_SIGNED_IN" };

  const existing = await db.wishlist.findUnique({
    where: { customerId_productId: { customerId: customer.id, productId } },
  });

  if (existing) {
    await db.wishlist.delete({ where: { id: existing.id } });
    return { ok: true, saved: false };
  }

  await db.wishlist.create({ data: { customerId: customer.id, productId } });
  return { ok: true, saved: true };
}

/**
 * Merges a guest's localStorage wishlist into the DB once, right after
 * sign-in — additive only (never removes a DB-side item the guest's local
 * list didn't happen to include).
 */
export async function syncWishlistAction(productIds) {
  const customer = await getCurrentCustomer();
  if (!customer || !Array.isArray(productIds) || productIds.length === 0) return;

  await db.wishlist.createMany({
    data: productIds.map((productId) => ({ customerId: customer.id, productId })),
    skipDuplicates: true,
  });
}
