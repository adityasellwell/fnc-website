import { db } from "@/lib/db";

export async function listCoupons() {
  return db.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getCouponById(id) {
  return db.coupon.findUnique({ where: { id } });
}

export async function createCoupon(data) {
  return db.coupon.create({ data });
}

export async function updateCoupon(id, data) {
  return db.coupon.update({ where: { id }, data });
}

export async function deleteCoupon(id) {
  return db.coupon.delete({ where: { id } });
}
