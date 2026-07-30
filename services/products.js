import { db } from "@/lib/db";

const PAGE_SIZE = 20;

export async function listProducts({ search, categoryId, page = 1 } = {}) {
  const where = {
    ...(search ? { name: { contains: search } } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);

  return { products, totalCount, totalPages: Math.ceil(totalCount / PAGE_SIZE) || 1, pageSize: PAGE_SIZE };
}

export async function getProductById(id) {
  return db.product.findUnique({ where: { id }, include: { category: true } });
}

export async function createProduct(data) {
  return db.product.create({ data });
}

export async function updateProduct(id, data) {
  return db.product.update({ where: { id }, data });
}

export async function deleteProduct(id) {
  return db.product.delete({ where: { id } });
}

export async function updateStock(id, stock) {
  return db.product.update({ where: { id }, data: { stock } });
}
