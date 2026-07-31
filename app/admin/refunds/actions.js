"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { processRefundRequest } from "@/services/refunds";

// Refund approval moves real money — kept Super-Admin-only (requireFullAdminUser)
// even though a Store Admin can already *initiate* a request from the Order
// Operations page, mirroring the separation-of-duties every other financial
// action (coupons, settings) already gets in this admin panel.
export async function processRefundAction(refundId, status, notes) {
  const admin = await requireFullAdminUser();
  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new Error("Invalid refund status");
  }
  await processRefundRequest(refundId, status, notes, admin.id);
  revalidatePath("/admin/refunds");
  revalidatePath("/admin/orders");
}
