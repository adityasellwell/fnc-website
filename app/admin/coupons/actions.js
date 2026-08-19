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
  const appliesTo = formData.get("appliesTo").toString();

  if (type === "COUPON" && !code) {
    throw new Error("A coupon code is required for type Coupon.");
  }

  const base = {
    type,
    code: code || null,
    title: formData.get("title").toString().trim(),
    description: formData.get("description")?.toString().trim() || null,
    discountType: formData.get("discountType").toString(),
    value: Number(formData.get("value")),
    minOrderValue: minOrderValue ? Number(minOrderValue) : null,
    appliesTo,
    bannerImage: bannerImage || null,
    startsAt: startsAt ? new Date(startsAt) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
    usageLimit: usageLimit ? Number(usageLimit) : null,
    active: formData.get("active") === "on" || formData.get("active") === "true",
  };

  return { base, appliesTo };
}

export async function createPromotionAction(formData) {
  try {
    await requireFullAdminUser();
    const { base, appliesTo } = parsePromotionForm(formData);
    
    let scopeProductsConnect = undefined;
    let scopeCategoryId = null;

    if (appliesTo === "PRODUCT") {
      const productIds = formData.getAll("productIds").map((id) => id.toString());
      if (productIds.length === 0) {
        return { error: "Select at least one product for a product-scoped promotion." };
      }
      scopeProductsConnect = { connect: productIds.map((id) => ({ id })) };
    } else if (appliesTo === "CATEGORY") {
      scopeCategoryId = formData.get("scopeCategoryId")?.toString() || null;
      if (!scopeCategoryId) {
        return { error: "Select a category for a category-scoped promotion." };
      }
    }

    await createPromotion({
      ...base,
      scopeCategoryId,
      ...(scopeProductsConnect ? { scopeProducts: scopeProductsConnect } : {}),
    });
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Failed to create promotion" };
  }
}

export async function updatePromotionAction(id, formData) {
  try {
    await requireFullAdminUser();
    const { base, appliesTo } = parsePromotionForm(formData);
    
    let scopeProductsSet = [];
    let scopeCategoryId = null;

    if (appliesTo === "PRODUCT") {
      const productIds = formData.getAll("productIds").map((id) => id.toString());
      if (productIds.length === 0) {
        return { error: "Select at least one product for a product-scoped promotion." };
      }
      scopeProductsSet = productIds.map((id) => ({ id }));
    } else if (appliesTo === "CATEGORY") {
      scopeCategoryId = formData.get("scopeCategoryId")?.toString() || null;
      if (!scopeCategoryId) {
        return { error: "Select a category for a category-scoped promotion." };
      }
    }

    await updatePromotion(id, {
      ...base,
      scopeCategoryId,
      scopeProducts: {
        set: scopeProductsSet,
      },
    });
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Failed to update promotion" };
  }
}

export async function deletePromotionAction(id) {
  try {
    await requireFullAdminUser();
    await deletePromotion(id);
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Failed to delete promotion" };
  }
}
