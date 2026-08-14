"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { createCategory, updateCategory, deleteCategory, getCategoryById } from "@/services/categories";
import { db } from "@/lib/db";

// Same fix as products: a manual free-text slug field let an admin type
// anything in, and the raw name once ended up in the URL and 404d live.
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base) {
  let slug = base || "category";
  let n = 2;
  while (await db.category.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function parseCategoryForm(formData) {
  const parentCategoryId = formData.get("parentCategoryId")?.toString().trim();
  return {
    name: formData.get("name").toString().trim(),
    description: formData.get("description")?.toString().trim() ?? "",
    image: formData.get("image")?.toString().trim() ?? "",
    order: Number(formData.get("order")) || 0,
    parentCategoryId: parentCategoryId || null,
  };
}

export async function createCategoryAction(formData) {
  await requireFullAdminUser();
  const data = parseCategoryForm(formData);
  const slug = await uniqueSlug(slugify(data.name));
  await createCategory({ ...data, slug });
  revalidatePath("/admin/categories");
  revalidatePath("/shop", "layout");
  revalidatePath("/");
}

export async function updateCategoryAction(id, formData) {
  await requireFullAdminUser();
  const data = parseCategoryForm(formData);
  await updateCategory(id, data);
  revalidatePath("/admin/categories");
  revalidatePath("/shop", "layout");
  revalidatePath("/");
}

export async function deleteCategoryAction(id) {
  await requireFullAdminUser();
  const category = await getCategoryById(id);
  await deleteCategory(id);
  revalidatePath("/admin/categories");
  revalidatePath("/shop", "layout");
  if (category) revalidatePath(`/shop/${category.slug}`);
  revalidatePath("/");
}
