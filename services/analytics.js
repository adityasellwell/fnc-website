import { db } from "@/lib/db";

/**
 * Business metrics first, per docs/milestones.md — revenue/orders/AOV/top
 * products/new-vs-returning/popular searches. All-time totals, no date-range
 * picker or charting infra yet; add those only if actually needed later.
 */
export async function getRevenueStats(storeId) {
  const wherePaid = {
    paymentStatus: "PAID",
    ...(storeId ? { storeId } : {}),
  };
  const whereActive = {
    status: { notIn: ["CANCELLED", "REFUNDED"] },
    ...(storeId ? { storeId } : {}),
  };
  const whereCancelled = {
    status: "CANCELLED",
    ...(storeId ? { storeId } : {}),
  };

  const [paidAgg, orderCount, cancelledCount] = await Promise.all([
    db.order.aggregate({
      where: wherePaid,
      _sum: { total: true },
      _count: true,
    }),
    db.order.count({ where: whereActive }),
    db.order.count({ where: whereCancelled }),
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

export async function getTopProducts(limit = 5, storeId) {
  const where = storeId ? { order: { storeId } } : {};
  const grouped = await db.orderItem.groupBy({
    by: ["productId"],
    where,
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

export async function getCustomerBreakdown(storeId) {
  const where = storeId ? { orders: { some: { storeId } } } : {};

  const [totalCustomers, customersWithOrders] = await Promise.all([
    db.customer.count({ where }),
    db.customer.findMany({
      where,
      select: {
        _count: {
          select: {
            orders: storeId ? { where: { storeId } } : true,
          },
        },
      },
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

export async function getStoreBreakdown() {
  const stores = await db.store.findMany({ where: { status: "ACTIVE" } });

  const results = [];
  for (const store of stores) {
    const stats = await getRevenueStats(store.id);
    results.push({
      storeId: store.id,
      storeName: store.name,
      ...stats,
    });
  }

  // Calculate platform total
  const platformStats = await getRevenueStats();
  results.push({
    storeId: "total",
    storeName: "Platform Total",
    ...platformStats,
  });

  return results;
}
