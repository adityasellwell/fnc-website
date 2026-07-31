"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { createPromotion, updatePromotion, deletePromotion } from "@/services/promotions";

function parsePromotionForm(formData) {
  const minOrderValue = formData.get("minOrderValue")?.toString().trim();
  const usageLimit = formData.get("usageLimit")?.toString().trim();
  const code = formData.get("code")?.toString().trim().toUpperCase();
  const type = formData.get("type").toString();
  const startsAt = formData.get("startsAt")?.toString().trim();
  const endsAt = formData.get("endsAt")?.toString().trim();
  const bannerImage = formData.get("bannerImage")?.toString().trim();

  if (type === "COUPON" && !code) {
    throw new Error("A coupon code is required for type Coupon.");
  }

  return {
    type,
    code: code || null,
    title: formData.get("title").toString().trim(),
    description: formData.get("description")?.toString().trim() || null,
    discountType: formData.get("discountType").toString(),
    value: Number(formData.get("value")),
    minOrderValue: minOrderValue ? Number(minOrderValue) : null,
    appliesTo: formData.get("appliesTo").toString(),
    bannerImage: bannerImage || null,
    startsAt: startsAt ? new Date(startsAt) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
    usageLimit: usageLimit ? Number(usageLimit) : null,
    active: formData.get("active") === "on",
  };
}

export async function createPromotionAction(formData) {
  await requireFullAdminUser();
  await createPromotion(parsePromotionForm(formData));
  revalidatePath("/admin/coupons");
}

export async function updatePromotionAction(id, formData) {
  await requireFullAdminUser();
  await updatePromotion(id, parsePromotionForm(formData));
  revalidatePath("/admin/coupons");
}

export async function deletePromotionAction(id) {
  await requireFullAdminUser();
  await deletePromotion(id);
  revalidatePath("/admin/coupons");
}
