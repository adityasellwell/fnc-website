import { db } from "@/lib/db";

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
    },
  });
}

/**
 * Advances (or otherwise changes) an order's status, logging who did it and
 * when in the same transaction — OrderStatusHistory is the audit trail the
 * admin Orders screen and a future customer-facing tracker both read from.
 */
export async function updateOrderStatus(orderId, status, changedById) {
  const order = await db.order.findUnique({ where: { id: orderId } });

  return db.$transaction(async (tx) => {
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

export async function createOrderRefund(orderId, amount, reason, userId) {
  return db.$transaction(async (tx) => {
    const request = await tx.refundRequest.create({
      data: {
        orderId,
        amount,
        reason,
        status: "PENDING",
      },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: "CREATE_REFUND_REQUEST",
        entityType: "Order",
        entityId: orderId,
        storeId: request.orderId ? (await tx.order.findUnique({ where: { id: orderId } }))?.storeId : null,
        details: { amount, reason },
      },
    });
    return request;
  });
}
