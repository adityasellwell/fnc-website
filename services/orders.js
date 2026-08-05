import { db } from "@/lib/db";
import { initiateRazorpayRefund } from "@/services/payment";
import { sendReviewRequestEmail, sendOrderStatusUpdateEmail } from "@/lib/email";

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

  // Only nudge on the actual transition into a status, never re-fire if
  // an admin re-saves the same status or corrects it later.
  const isNewStatus = order?.status !== status;
  if (isNewStatus && order?.customer?.email) {
    if (["DELIVERED", "COLLECTED"].includes(status)) {
      sendReviewRequestEmail(order.customer, { ...order, status });
    } else if (["PREPARING", "OUT_FOR_DELIVERY", "READY_FOR_PICKUP"].includes(status)) {
      sendOrderStatusUpdateEmail(order.customer, { ...order, status }, status);
    }
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

/**
 * Assigns a real DeliveryPartner to an order — replaces the old free-text
 * rider fields with a real linked record, still snapshotting name/phone
 * onto riderName/riderPhone so existing displays (customer tracking page)
 * keep working unchanged. Generates the OTP the partner will need to
 * confirm handoff with the customer.
 */
export async function assignDeliveryPartner(orderId, partnerId, userId) {
  const partner = await db.deliveryPartner.findUnique({ where: { id: partnerId } });
  if (!partner) throw new Error("Delivery partner not found");

  const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

  const order = await db.order.update({
    where: { id: orderId },
    data: {
      deliveryPartnerId: partnerId,
      riderName: partner.name,
      riderPhone: partner.phone,
      deliveryOtp,
    },
  });
  await db.auditLog.create({
    data: {
      userId,
      action: "ASSIGN_DELIVERY_PARTNER",
      entityType: "Order",
      entityId: orderId,
      storeId: order.storeId,
      details: { partnerId, partnerName: partner.name },
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

/**
 * Orders currently assigned to a delivery partner and still in-flight —
 * powers the partner's own dashboard, scoped strictly to their id.
 */
export async function listOrdersForDeliveryPartner(partnerId) {
  return db.order.findMany({
    where: {
      deliveryPartnerId: partnerId,
      status: { in: ["PREPARING", "OUT_FOR_DELIVERY"] },
    },
    include: { items: { include: { product: true } }, customer: true },
    orderBy: { createdAt: "asc" },
  });
}

async function assertOrderBelongsToPartner(orderId, partnerId) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.deliveryPartnerId !== partnerId) {
    throw new Error("Order not found or not assigned to you");
  }
  return order;
}

/** Partner marks an order picked up from the store — PREPARING -> OUT_FOR_DELIVERY. */
export async function markOrderPickedUp(orderId, partnerId) {
  const order = await assertOrderBelongsToPartner(orderId, partnerId);
  if (order.status !== "PREPARING") throw new Error("Order isn't ready to be picked up");
  return updateOrderStatus(orderId, "OUT_FOR_DELIVERY", null);
}

/**
 * Partner confirms handoff with the customer's OTP — OUT_FOR_DELIVERY -> DELIVERED.
 * The OTP check is the only thing standing between "I dropped it off" and
 * an actual confirmed delivery, so it's verified server-side here, not
 * trusted from the client.
 */
export async function markOrderDelivered(orderId, partnerId, otp) {
  const order = await assertOrderBelongsToPartner(orderId, partnerId);
  if (order.status !== "OUT_FOR_DELIVERY") throw new Error("Order isn't out for delivery");
  if (!order.deliveryOtp || order.deliveryOtp !== otp?.toString().trim()) {
    throw new Error("Incorrect OTP");
  }
  await db.order.update({ where: { id: orderId }, data: { deliveryOtp: null } });
  return updateOrderStatus(orderId, "DELIVERED", null);
}
