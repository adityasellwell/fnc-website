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
  // categoryId is a required (non-nullable) field on Product, and there's
  // no cascade configured — a plain delete() would crash with the same
  // silent P2003 foreign key error the product-delete bug had. Blocking
  // with a clear reason is also just correct here: deleting a category
  // that still has products in it should never be a one-click accident.
  const [productCount, subcategoryCount] = await Promise.all([
    db.product.count({ where: { categoryId: id } }),
    db.category.count({ where: { parentCategoryId: id } }),
  ]);
  if (productCount > 0) {
    throw new Error(
      `This category has ${productCount} product${productCount === 1 ? "" : "s"} in it. Move or delete them first.`
    );
  }
  if (subcategoryCount > 0) {
    throw new Error(
      `This category has ${subcategoryCount} subcategor${subcategoryCount === 1 ? "y" : "ies"} under it. Move or delete them first.`
    );
  }
  return db.category.delete({ where: { id } });
}
