"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { createCategory, updateCategory, deleteCategory } from "@/services/categories";

function parseCategoryForm(formData) {
  const parentCategoryId = formData.get("parentCategoryId")?.toString().trim();
  return {
    slug: formData.get("slug").toString().trim(),
    name: formData.get("name").toString().trim(),
    description: formData.get("description")?.toString().trim() ?? "",
    image: formData.get("image")?.toString().trim() ?? "",
    order: Number(formData.get("order")) || 0,
    parentCategoryId: parentCategoryId || null,
  };
}

export async function createCategoryAction(formData) {
  await requireAdminUser();
  await createCategory(parseCategoryForm(formData));
  revalidatePath("/admin/categories");
}

export async function updateCategoryAction(id, formData) {
  await requireAdminUser();
  await updateCategory(id, parseCategoryForm(formData));
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(id) {
  await requireAdminUser();
  await deleteCategory(id);
  revalidatePath("/admin/categories");
}
