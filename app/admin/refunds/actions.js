"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { processRefundRequest } from "@/services/refunds";
import { db } from "@/lib/db";
import { sendRefundApprovedEmail, sendRefundRejectedEmail } from "@/lib/email";

/**
 * Refund approval moves real money — Super-Admin-only.
 * On APPROVED: calls Razorpay API before marking DB (never marks DB on failure).
 * On REJECTED: updates status + sends rejection email to customer.
 */
export async function processRefundAction(refundId, decision, adminNotes, finalAmount) {
  try {
    const admin = await requireFullAdminUser();

    if (!["APPROVED", "REJECTED"].includes(decision)) {
      return { ok: false, error: "Invalid decision" };
    }

    const updated = await processRefundRequest(refundId, decision, adminNotes, admin.id, finalAmount);

    // Non-blocking email notifications
    const refundWithOrder = await db.refundRequest.findUnique({
      where: { id: refundId },
      include: { order: { include: { customer: true } } },
    });

    if (refundWithOrder?.order?.customer?.email) {
      const { customer, ...order } = refundWithOrder.order;
      if (decision === "APPROVED") {
        sendRefundApprovedEmail(
          customer,
          order,
          updated.amount,
          updated.razorpayRefundId
        );
      } else {
        sendRefundRejectedEmail(customer, order, adminNotes);
      }
    }

    revalidatePath("/admin/refunds");
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    console.error("[processRefundAction]", err);
    return { ok: false, error: err.message || "Failed to process refund" };
  }
}
