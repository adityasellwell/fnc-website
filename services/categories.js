import { db } from "@/lib/db";

export async function listCategories() {
  return db.category.findMany({
    orderBy: { order: "asc" },
    include: { parentCategory: true, _count: { select: { products: true } } },
  });
}

export async function getCategoryById(id) {
  return db.category.findUnique({ where: { id } });
}

export async function createCategory(data) {
  return db.category.create({ data });
}

export async function updateCategory(id, data) {
  return db.category.update({ where: { id }, data });
}

export async function deleteCategory(id) {
  return db.category.delete({ where: { id } });
}
