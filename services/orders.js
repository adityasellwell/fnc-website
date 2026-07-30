import { db } from "@/lib/db";

const PAGE_SIZE = 20;

export async function listOrders({ status, fulfillmentType, page = 1 } = {}) {
  const where = {
    ...(status ? { status } : {}),
    ...(fulfillmentType ? { fulfillmentType } : {}),
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
  return db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status } }),
    db.orderStatusHistory.create({ data: { orderId, status, changedById } }),
  ]);
}
