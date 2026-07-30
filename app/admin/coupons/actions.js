"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { createCoupon, updateCoupon, deleteCoupon } from "@/services/coupons";

function parseCouponForm(formData) {
  const minOrderValue = formData.get("minOrderValue")?.toString().trim();
  const usageLimit = formData.get("usageLimit")?.toString().trim();

  return {
    code: formData.get("code").toString().trim().toUpperCase(),
    type: formData.get("type").toString(),
    value: Number(formData.get("value")),
    minOrderValue: minOrderValue ? Number(minOrderValue) : null,
    appliesTo: formData.get("appliesTo").toString(),
    expiryDate: new Date(formData.get("expiryDate").toString()),
    usageLimit: usageLimit ? Number(usageLimit) : null,
    active: formData.get("active") === "on",
  };
}

export async function createCouponAction(formData) {
  await requireAdminUser();
  await createCoupon(parseCouponForm(formData));
  revalidatePath("/admin/coupons");
}

export async function updateCouponAction(id, formData) {
  await requireAdminUser();
  await updateCoupon(id, parseCouponForm(formData));
  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(id) {
  await requireAdminUser();
  await deleteCoupon(id);
  revalidatePath("/admin/coupons");
}
