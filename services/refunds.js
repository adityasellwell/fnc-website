import { db } from "@/lib/db";
import { initiateRazorpayRefund } from "@/services/payment";

/** Statuses where a refund request is allowed (kitchen has started or order delivered) */
const REFUNDABLE_ORDER_STATUSES = [
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "READY_FOR_PICKUP",
  "COLLECTED",
];

/** Hours after delivery within which refund can be requested */
const REFUND_WINDOW_HOURS = 24;

export async function listRefundRequests() {
  return db.refundRequest.findMany({
    include: {
      order: {
        include: {
          customer: true,
          store: true,
          items: { include: { product: true } },
        },
        // Fetch razorpayPaymentId alongside other order fields (it's a scalar, always included)
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Customer creates a refund request.
 * Validates eligibility, 24h window, and prevents duplicates.
 */
export async function createRefundRequest({
  orderId,
  customerId,
  category,
  reason,
  photoUrl = null,
}) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { refundRequest: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.customerId !== customerId) throw new Error("Access denied");
  if (order.paymentStatus !== "PAID") {
    throw new Error("Refund can only be requested for paid orders");
  }
  if (!REFUNDABLE_ORDER_STATUSES.includes(order.status)) {
    throw new Error(
      "Refund request not applicable for this order status. If your order is still PLACED or CONFIRMED, you can cancel it instead."
    );
  }
  if (order.refundRequest) {
    throw new Error("A refund request already exists for this order");
  }

  // 24-hour window for delivered/collected orders
  if (["DELIVERED", "COLLECTED"].includes(order.status)) {
    const deliveredAt = order.updatedAt;
    const hoursSinceDelivery =
      (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceDelivery > REFUND_WINDOW_HOURS) {
      throw new Error(
        `Refund requests must be submitted within ${REFUND_WINDOW_HOURS} hours of delivery`
      );
    }
  }

  const request = await db.refundRequest.create({
    data: {
      orderId,
      category,
      reason: reason || "",
      photoUrl,
      status: "REQUESTED",
      amount: order.total,
      initiatedBy: "CUSTOMER",
    },
  });

  await db.auditLog.create({
    data: {
      action: "CUSTOMER_REFUND_REQUEST",
      entityType: "Order",
      entityId: orderId,
      storeId: order.storeId,
      details: { category, reason, photoUrl },
    },
  });

  return request;
}

/**
 * Customer cancels their own PENDING refund request.
 */
export async function cancelRefundRequest(refundRequestId, customerId) {
  const refund = await db.refundRequest.findUnique({
    where: { id: refundRequestId },
    include: { order: { select: { customerId: true } } },
  });

  if (!refund) throw new Error("Refund request not found");
  if (refund.order.customerId !== customerId) throw new Error("Access denied");
  if (refund.status !== "REQUESTED") {
    throw new Error("Only REQUESTED refund requests can be cancelled");
  }

  return db.refundRequest.update({
    where: { id: refundRequestId },
    data: { status: "CANCELLED" },
  });
}

/**
 * Admin processes a refund request — approve or reject.
 * On APPROVED: calls Razorpay API first, only marks DB REFUNDED on success.
 * On REJECTED: updates status, sends rejection note to customer.
 */
export async function processRefundRequest(refundId, decision, adminNotes, adminId, finalAmount) {
  if (!["APPROVED", "REJECTED"].includes(decision)) {
    throw new Error("Invalid decision — must be APPROVED or REJECTED");
  }

  const refund = await db.refundRequest.findUnique({
    where: { id: refundId },
    include: {
      order: {
        select: {
          id: true,
          total: true,
          razorpayPaymentId: true,
          storeId: true,
          paymentStatus: true,
        },
      },
    },
  });

  if (!refund) throw new Error("Refund request not found");
  if (!["REQUESTED", "UNDER_REVIEW"].includes(refund.status)) {
    throw new Error("This refund request has already been processed");
  }

  if (decision === "REJECTED") {
    return db.$transaction(async (tx) => {
      const updated = await tx.refundRequest.update({
        where: { id: refundId },
        data: { status: "REJECTED", adminNotes, processedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "ADMIN_REJECT_REFUND",
          entityType: "RefundRequest",
          entityId: refundId,
          details: { adminNotes },
        },
      });
      return updated;
    });
  }

  // APPROVED path — Razorpay first, THEN DB
  const amountToRefund =
    finalAmount && Number(finalAmount) <= Number(refund.order.total)
      ? Number(finalAmount)
      : Number(refund.amount);

  const amountPaise = Math.round(amountToRefund * 100);

  // Mark as PROCESSING first so admin knows we're in-flight
  await db.refundRequest.update({
    where: { id: refundId },
    data: { status: "PROCESSING", adminNotes },
  });

  let razorpayRefundId;
  try {
    const rzResult = await initiateRazorpayRefund(
      refund.order.razorpayPaymentId,
      amountPaise,
      `Refund approved for order ${refund.orderId}: ${adminNotes || refund.reason}`
    );
    razorpayRefundId = rzResult.id;
  } catch (err) {
    // Razorpay failed — roll back to UNDER_REVIEW so admin can retry
    await db.refundRequest.update({
      where: { id: refundId },
      data: { status: "UNDER_REVIEW", adminNotes: `[RAZORPAY ERROR] ${err.message}` },
    });
    throw new Error(`Razorpay refund failed: ${err.message}`);
  }

  // Razorpay succeeded — now atomically update DB
  return db.$transaction(async (tx) => {
    const updated = await tx.refundRequest.update({
      where: { id: refundId },
      data: {
        status: "REFUNDED",
        amount: amountToRefund,
        razorpayRefundId,
        adminNotes,
        processedAt: new Date(),
      },
    });

    await tx.order.update({
      where: { id: refund.orderId },
      data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
    });

    await tx.orderStatusHistory.create({
      data: { orderId: refund.orderId, status: "REFUNDED", changedById: adminId },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: "ADMIN_APPROVE_REFUND",
        entityType: "RefundRequest",
        entityId: refundId,
        details: { amountToRefund, razorpayRefundId, adminNotes },
      },
    });

    return updated;
  });
}
