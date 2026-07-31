import { db } from "@/lib/db";

export async function listPromotions() {
  return db.promotion.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getPromotionById(id) {
  return db.promotion.findUnique({ where: { id } });
}

export async function getActivePromotionByCode(code) {
  return db.promotion.findFirst({
    where: { code, active: true },
    include: { scopeProducts: { select: { id: true, name: true, slug: true, images: true, price: true } } },
  });
}

export async function createPromotion(data) {
  return db.promotion.create({ data });
}

export async function updatePromotion(id, data) {
  return db.promotion.update({ where: { id }, data });
}

export async function deletePromotion(id) {
  return db.promotion.delete({ where: { id } });
}
