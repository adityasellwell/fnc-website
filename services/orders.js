import { db } from "@/lib/db";
import { initiateRazorpayRefund } from "@/services/payment";
import { sendReviewRequestEmail } from "@/lib/email";

const PAGE_SIZE = 10;

export async function listOrders({ status, fulfillmentType, page = 1, storeId } = {}) {
  const where = {
    ...(status ? { status } : {}),
    ...(fulfillmentType ? { fulfillmentType } : {}),
    ...(storeId ? { storeId } : {}),
  };

  const [orders, totalCount] = await Promise.all([
    db.order.findMany({
      where,
      include: { customer: true, store: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.order.count({ where }),
  ]);

  return { orders, totalCount, totalPages: Math.ceil(totalCount / PAGE_SIZE) || 1, pageSize: PAGE_SIZE };
}

export async function getOrderStoreId(id) {
  const order = await db.order.findUnique({ where: { id }, select: { storeId: true } });
  return order?.storeId ?? null;
}

export async function getOrderById(id) {
  return db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      store: true,
      items: { include: { product: true } },
      statusHistory: { orderBy: { timestamp: "asc" }, include: { changedBy: true } },
      refundRequest: true,
      reviews: { select: { productId: true } },
    },
  });
}

/**
 * Advances (or otherwise changes) an order's status, logging who did it and
 * when in the same transaction.
 */
export async function updateOrderStatus(orderId, status, changedById) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { customer: true },
  });

  const result = await db.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id: orderId }, data: { status } });
    await tx.orderStatusHistory.create({ data: { orderId, status, changedById } });
    await tx.auditLog.create({
      data: {
        userId: changedById,
        action: `UPDATE_STATUS_${status}`,
        entityType: "Order",
        entityId: orderId,
        storeId: order?.storeId || null,
        details: { status },
      },
    });
    return [updated];
  });

  // Only nudge on the transition INTO a completed status, never re-fire
  // if an admin re-saves the same status or corrects it later.
  const isNewlyCompleted =
    ["DELIVERED", "COLLECTED"].includes(status) && order?.status !== status;
  if (isNewlyCompleted && order?.customer?.email) {
    sendReviewRequestEmail(order.customer, { ...order, status });
  }

  return result;
}

export async function updateOrderPackingNotes(orderId, notes, userId) {
  const order = await db.order.update({
    where: { id: orderId },
    data: { packingNotes: notes },
  });
  await db.auditLog.create({
    data: {
      userId,
      action: "UPDATE_PACKING_NOTES",
      entityType: "Order",
      entityId: orderId,
      storeId: order.storeId,
      details: { packingNotes: notes },
    },
  });
  return order;
}

export async function assignOrderRider(orderId, name, phone, userId) {
  const order = await db.order.update({
    where: { id: orderId },
    data: { riderName: name, riderPhone: phone },
  });
  await db.auditLog.create({
    data: {
      userId,
      action: "ASSIGN_RIDER",
      entityType: "Order",
      entityId: orderId,
      storeId: order.storeId,
      details: { riderName: name, riderPhone: phone },
    },
  });
  return order;
}

/**
 * Customer-initiated order cancellation.
 * Only allowed on PLACED or CONFIRMED orders.
 * If the order is PAID, automatically triggers a Razorpay refund before updating DB.
 */
export async function cancelOrder(orderId, customerId) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      customerId: true,
      status: true,
      paymentStatus: true,
      total: true,
      razorpayPaymentId: true,
      storeId: true,
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.customerId !== customerId) throw new Error("Access denied");
  if (!["PLACED", "CONFIRMED"].includes(order.status)) {
    throw new Error("Order cannot be cancelled — kitchen has already started");
  }

  let razorpayRefundId = null;

  // If payment was already captured, trigger Razorpay refund FIRST
  if (order.paymentStatus === "PAID" && order.razorpayPaymentId) {
    const amountPaise = Math.round(Number(order.total) * 100);
    const refund = await initiateRazorpayRefund(
      order.razorpayPaymentId,
      amountPaise,
      "Customer cancelled order"
    );
    razorpayRefundId = refund.id;
  }

  // DB update only after Razorpay succeeds (or if no payment was made)
  return db.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus,
      },
    });
    await tx.orderStatusHistory.create({ data: { orderId, status: "CANCELLED" } });
    await tx.auditLog.create({
      data: {
        action: "CUSTOMER_CANCEL_ORDER",
        entityType: "Order",
        entityId: orderId,
        storeId: order.storeId,
        details: { razorpayRefundId, autoRefund: !!razorpayRefundId },
      },
    });
    // If we issued a refund, also create a RefundRequest record for audit trail
    if (razorpayRefundId) {
      await tx.refundRequest.upsert({
        where: { orderId },
        create: {
          orderId,
          category: "DUPLICATE_ORDER",
          reason: "Customer cancelled order before preparation started",
          status: "REFUNDED",
          amount: order.total,
          razorpayRefundId,
          initiatedBy: "CUSTOMER",
          processedAt: new Date(),
        },
        update: {
          status: "REFUNDED",
          razorpayRefundId,
          processedAt: new Date(),
        },
      });
    }
    return { ...updated, razorpayRefundId };
  });
}

/**
 * Admin-initiated refund request creation (from order detail page).
 * Kept for backward compat — the main path is now customer-initiated.
 */
export async function createOrderRefund(orderId, amount, reason, userId) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, paymentStatus: true, total: true, storeId: true, refundRequest: true },
    include: { refundRequest: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.refundRequest) throw new Error("A refund request already exists for this order");
  if (order.paymentStatus !== "PAID") throw new Error("Cannot create a refund for an unpaid order");

  return db.$transaction(async (tx) => {
    const request = await tx.refundRequest.create({
      data: {
        orderId,
        category: "OTHER",
        reason,
        amount: Math.min(amount, Number(order.total)),
        status: "REQUESTED",
        initiatedBy: "ADMIN",
      },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: "ADMIN_CREATE_REFUND_REQUEST",
        entityType: "Order",
        entityId: orderId,
        storeId: order.storeId,
        details: { amount, reason },
      },
    });
    return request;
  });
}
