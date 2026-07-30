"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
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
  await requireAdminUser();
  await createBanner(parseBannerForm(formData));
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function updateBannerAction(id, formData) {
  await requireAdminUser();
  await updateBanner(id, parseBannerForm(formData));
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBannerAction(id) {
  await requireAdminUser();
  await deleteBanner(id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
