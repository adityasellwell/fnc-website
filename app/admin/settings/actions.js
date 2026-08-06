"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { updateSettings } from "@/services/settings";

export async function updateSettingsAction(formData) {
  await requireFullAdminUser();

  const data = {
    deliveryRadiusKm: parseFloat(formData.get("deliveryRadiusKm")),
    deliveryCharge: parseFloat(formData.get("deliveryCharge")),
    minOrderValue: parseFloat(formData.get("minOrderValue")),
    freeDeliveryThreshold: parseFloat(formData.get("freeDeliveryThreshold")),
    businessInfo: {
      phone: formData.get("businessPhone")?.toString().trim() || "",
      whatsapp: formData.get("businessWhatsapp")?.toString().trim() || "",
      email: formData.get("businessEmail")?.toString().trim() || "",
    },
  };

  await updateSettings(data);

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  revalidatePath("/contact");
  revalidatePath("/", "layout");
}
