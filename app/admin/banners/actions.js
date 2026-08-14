"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { createBanner, updateBanner, deleteBanner } from "@/services/banners";

function parseBannerForm(formData) {
  const startsAt = formData.get("startsAt")?.toString().trim();
  const endsAt = formData.get("endsAt")?.toString().trim();

  return {
    placement: formData.get("placement").toString(),
    device: formData.get("device").toString(),
    image: formData.get("image").toString().trim(),
    link: formData.get("link").toString().trim(),
    title: formData.get("title")?.toString().trim() || null,
    subtitle: formData.get("subtitle")?.toString().trim() || null,
    ctaLabel: formData.get("ctaLabel")?.toString().trim() || null,
    priority: Number(formData.get("priority")) || 0,
    startsAt: startsAt ? new Date(startsAt) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
  };
}

export async function createBannerAction(formData) {
  try {
    await requireFullAdminUser();
    const data = parseBannerForm(formData);
    if (!data.image) return { error: "Banner image is required" };
    if (!data.link) return { error: "Banner link is required" };
    await createBanner(data);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Failed to create banner" };
  }
}

export async function updateBannerAction(id, formData) {
  try {
    await requireFullAdminUser();
    const data = parseBannerForm(formData);
    if (!data.image) return { error: "Banner image is required" };
    if (!data.link) return { error: "Banner link is required" };
    await updateBanner(id, data);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Failed to update banner" };
  }
}

export async function deleteBannerAction(id) {
  try {
    await requireFullAdminUser();
    await deleteBanner(id);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Failed to delete banner" };
  }
}
