import { db } from "@/lib/db";

export async function listVariantOptions() {
  return db.variantOption.findMany({ orderBy: [{ type: "asc" }, { order: "asc" }] });
}

export async function createVariantOption(data) {
  return db.variantOption.create({ data });
}

export async function updateVariantOption(id, data) {
  return db.variantOption.update({ where: { id }, data });
}

export async function deleteVariantOption(id) {
  // A master value in use by any product's ProductVariant rows is
  // protected by a real FK (onDelete: Restrict) — same "block, don't
  // crash" pattern as products/categories/stores rather than a raw
  // delete() that would throw an unfriendly P2003.
  const usedCount = await db.productVariant.count({ where: { variantOptionId: id } });
  if (usedCount > 0) {
    throw new Error(
      `This value is used by ${usedCount} product variant${usedCount === 1 ? "" : "s"} and can't be deleted. Remove it from those products first.`
    );
  }
  return db.variantOption.delete({ where: { id } });
}
