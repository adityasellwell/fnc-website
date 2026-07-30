import { db } from "@/lib/db";

/**
 * Business metrics first, per docs/milestones.md — revenue/orders/AOV/top
 * products/new-vs-returning/popular searches. All-time totals, no date-range
 * picker or charting infra yet; add those only if actually needed later.
 */
export async function getRevenueStats() {
  const [paidAgg, orderCount, cancelledCount] = await Promise.all([
    db.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
      _count: true,
    }),
    db.order.count({ where: { status: { notIn: ["CANCELLED", "REFUNDED"] } } }),
    db.order.count({ where: { status: "CANCELLED" } }),
  ]);

  const revenue = Number(paidAgg._sum.total ?? 0);
  const paidCount = paidAgg._count;

  return {
    revenue,
    orderCount,
    cancelledCount,
    averageOrderValue: paidCount > 0 ? revenue / paidCount : 0,
  };
}

export async function getTopProducts(limit = 5) {
  const grouped = await db.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const products = await db.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  return grouped.map((g) => ({
    productId: g.productId,
    name: nameById.get(g.productId) ?? "Unknown product",
    unitsSold: g._sum.quantity ?? 0,
  }));
}

export async function getCustomerBreakdown() {
  const [totalCustomers, customersWithOrders] = await Promise.all([
    db.customer.count(),
    db.customer.findMany({
      select: { _count: { select: { orders: true } } },
    }),
  ]);

  const returning = customersWithOrders.filter((c) => c._count.orders > 1).length;
  const oneTime = customersWithOrders.filter((c) => c._count.orders === 1).length;

  return { totalCustomers, returning, oneTime };
}

export async function getPopularSearches(limit = 8) {
  const grouped = await db.searchLog.groupBy({
    by: ["query"],
    _count: { query: true },
    orderBy: { _count: { query: "desc" } },
    take: limit,
  });

  return grouped.map((g) => ({ query: g.query, count: g._count.query }));
}
