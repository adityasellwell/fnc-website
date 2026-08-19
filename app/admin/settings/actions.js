"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { updateSettings } from "@/services/settings";
import { WHY_CHOOSE_POINTS } from "@/lib/constants";

export async function updateSettingsAction(formData) {
  await requireFullAdminUser();

  // Each card's uploaded image comes through as its own field
  // ("whyCardImage__<title>") rather than one combined input — collect
  // them back into the { title: url } map Settings.whyChooseCardImages
  // actually stores, dropping any left blank.
  const whyChooseCardImages = {};
  for (const point of WHY_CHOOSE_POINTS) {
    const url = formData.get(`whyCardImage__${point.title}`)?.toString().trim();
    if (url) whyChooseCardImages[point.title] = url;
  }

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
    whyChooseCardImages,
    franchiseHeroImage: formData.get("franchiseHeroImage")?.toString().trim() || null,
  };

  await updateSettings(data);

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  revalidatePath("/contact");
  revalidatePath("/franchise");
  revalidatePath("/", "layout");
}
