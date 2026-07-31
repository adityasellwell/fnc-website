"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { createStoreAdmin, updateStoreAdmin, deleteStoreAdmin } from "@/services/stores";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function parseStoreForm(formData) {
  const openingHours = {};
  for (const day of DAYS) {
    openingHours[day] = formData.get(`hours_${day}`)?.toString().trim() || "Closed";
  }
  const image = formData.get("image")?.toString().trim();

  return {
    slug: formData.get("slug").toString().trim(),
    name: formData.get("name").toString().trim(),
    address: formData.get("address").toString().trim(),
    city: formData.get("city").toString().trim(),
    state: formData.get("state").toString().trim(),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    phone: formData.get("phone").toString().trim(),
    whatsapp: formData.get("whatsapp").toString().trim(),
    googleMapsLink: formData.get("googleMapsLink")?.toString().trim() || "",
    status: formData.get("status").toString(),
    deliveryAvailable: formData.get("deliveryAvailable") === "on",
    pickupAvailable: formData.get("pickupAvailable") === "on",
    openingHours,
    images: image ? [image] : [],
  };
}

export async function createStoreAction(formData) {
  await requireFullAdminUser();
  await createStoreAdmin(parseStoreForm(formData));
  revalidatePath("/admin/stores");
  revalidatePath("/stores");
  revalidatePath("/");
}

export async function updateStoreAction(id, formData) {
  await requireFullAdminUser();
  await updateStoreAdmin(id, parseStoreForm(formData));
  revalidatePath("/admin/stores");
  revalidatePath("/stores");
  revalidatePath("/");
}

export async function deleteStoreAction(id) {
  await requireFullAdminUser();
  await deleteStoreAdmin(id);
  revalidatePath("/admin/stores");
  revalidatePath("/stores");
  revalidatePath("/");
}
