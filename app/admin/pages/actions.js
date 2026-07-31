"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { upsertPage, deletePage } from "@/services/pages";

export async function savePageAction(formData) {
  await requireFullAdminUser();
  const slug = formData.get("slug").toString().trim();
  await upsertPage({
    slug,
    title: formData.get("title").toString().trim(),
    content: formData.get("content").toString(),
  });
  revalidatePath("/admin/pages");
  revalidatePath(`/${slug}`);
}

export async function deletePageAction(id) {
  await requireFullAdminUser();
  await deletePage(id);
  revalidatePath("/admin/pages");
}
