import { db } from "@/lib/db";

export async function listRefundRequests() {
  return db.refundRequest.findMany({
    include: { order: { include: { customer: true, store: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Approving marks the order itself REFUNDED (source of truth for order
 * status/history, same as every other status change) in the same
 * transaction as the refund request update — rejecting only updates the
 * request, the order's own status is left alone.
 */
export async function processRefundRequest(refundId, status, notes, adminId) {
  const refund = await db.refundRequest.findUnique({ where: { id: refundId } });
  if (!refund) throw new Error("Refund request not found");

  return db.$transaction(async (tx) => {
    const updated = await tx.refundRequest.update({
      where: { id: refundId },
      data: { status, notes: notes || refund.notes, processedAt: new Date() },
    });

    if (status === "APPROVED") {
      await tx.order.update({ where: { id: refund.orderId }, data: { status: "REFUNDED" } });
      await tx.orderStatusHistory.create({
        data: { orderId: refund.orderId, status: "REFUNDED", changedById: adminId },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: `PROCESS_REFUND_${status}`,
        entityType: "RefundRequest",
        entityId: refundId,
        details: { status, notes },
      },
    });

    return updated;
  });
}
