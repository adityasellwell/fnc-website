import { db } from "@/lib/db";

const PAGE_SIZE = 10;

export async function listCustomers({ search, page = 1, storeId } = {}) {
  const where = {
    ...(search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }, { phone: { contains: search } }] }
      : {}),
    ...(storeId ? { orders: { some: { storeId } } } : {}),
  };

  const [customers, totalCount] = await Promise.all([
    db.customer.findMany({
      where,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.customer.count({ where }),
  ]);

  return { customers, totalCount, totalPages: Math.ceil(totalCount / PAGE_SIZE) || 1, pageSize: PAGE_SIZE };
}

export async function getCustomerWithOrders(id, storeId) {
  return db.customer.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: {
        where: storeId ? { storeId } : {},
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      },
    },
  });
}
