"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { updateSettings } from "@/services/settings";

export async function updateSettingsAction(formData) {
  await requireAdminUser();

  const data = {
    deliveryRadiusKm: parseFloat(formData.get("deliveryRadiusKm")),
    deliveryCharge: parseFloat(formData.get("deliveryCharge")),
    minOrderValue: parseFloat(formData.get("minOrderValue")),
    freeDeliveryThreshold: parseFloat(formData.get("freeDeliveryThreshold")),
    zomatoUrl: formData.get("zomatoUrl")?.toString().trim() || null,
    swiggyUrl: formData.get("swiggyUrl")?.toString().trim() || null,
  };

  await updateSettings(data);

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
}
