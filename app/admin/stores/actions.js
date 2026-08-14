"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { createStoreAdmin, updateStoreAdmin, deleteStoreAdmin } from "@/services/stores";
import { db } from "@/lib/db";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base) {
  let slug = base || "store";
  let n = 2;
  while (await db.store.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function parseStoreForm(formData) {
  const openingHours = {};
  for (const day of DAYS) {
    openingHours[day] = formData.get(`hours_${day}`)?.toString().trim() || "Closed";
  }
  const image = formData.get("image")?.toString().trim();

  const linkLabels = formData.getAll("link_label").map((v) => v.toString().trim());
  const linkUrls = formData.getAll("link_url").map((v) => v.toString().trim());
  const deliveryPartnerLinks = linkLabels
    .map((label, i) => ({ label, url: linkUrls[i] || "" }))
    .filter((l) => l.label && l.url);

  return {
    name: formData.get("name").toString().trim(),
    address: formData.get("address").toString().trim(),
    city: formData.get("city").toString().trim(),
    state: formData.get("state").toString().trim(),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    phone: formData.get("phone").toString().trim(),
    whatsapp: formData.get("whatsapp").toString().trim(),
    googleMapsLink: formData.get("googleMapsLink")?.toString().trim() || "",
    deliveryPartnerLinks: deliveryPartnerLinks.length > 0 ? deliveryPartnerLinks : null,
    status: formData.get("status").toString(),
    deliveryAvailable: formData.get("deliveryAvailable") === "on",
    pickupAvailable: formData.get("pickupAvailable") === "on",
    openingHours,
    images: image ? [image] : [],
  };
}

export async function createStoreAction(formData) {
  try {
    await requireFullAdminUser();
    const data = parseStoreForm(formData);
    if (!data.name) return { error: "Store name is required" };
    if (!data.address) return { error: "Store address is required" };
    const slug = await uniqueSlug(slugify(data.name));
    const store = await createStoreAdmin({ ...data, slug });
    revalidatePath("/admin/stores");
    revalidatePath("/stores");
    revalidatePath(`/store/${store.slug}`);
    revalidatePath("/");
    return { ok: true, store };
  } catch (err) {
    return { error: err.message || "Failed to create store" };
  }
}

export async function updateStoreAction(id, formData) {
  try {
    await requireFullAdminUser();
    const data = parseStoreForm(formData);
    if (!data.name) return { error: "Store name is required" };
    if (!data.address) return { error: "Store address is required" };
    const store = await updateStoreAdmin(id, data);
    revalidatePath("/admin/stores");
    revalidatePath("/stores");
    revalidatePath(`/store/${store.slug}`);
    revalidatePath("/");
    return { ok: true, store };
  } catch (err) {
    return { error: err.message || "Failed to update store" };
  }
}

export async function deleteStoreAction(id) {
  try {
    await requireFullAdminUser();
    const store = await db.store.findUnique({ where: { id }, select: { slug: true } });
    await deleteStoreAdmin(id);
    revalidatePath("/admin/stores");
    revalidatePath("/stores");
    if (store) revalidatePath(`/store/${store.slug}`);
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Failed to delete store" };
  }
}
