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

// excludeId lets an update keep its own current slug instead of treating
// it as "taken" by itself when the name didn't actually change.
async function uniqueSlug(base, excludeId) {
  let slug = base || "category";
  let n = 2;
  while (true) {
    const existing = await db.category.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
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
  try {
    await requireFullAdminUser();
    const data = parseCategoryForm(formData);
    if (!data.name) return { error: "Category name is required" };
    const slug = await uniqueSlug(slugify(data.name));
    const category = await createCategory({ ...data, slug });
    revalidatePath("/admin/categories");
    revalidatePath("/shop", "layout");
    revalidatePath("/");
    return { ok: true, category };
  } catch (err) {
    return { error: err.message || "Failed to create category" };
  }
}

export async function updateCategoryAction(id, formData) {
  try {
    await requireFullAdminUser();
    const before = await getCategoryById(id);
    const data = parseCategoryForm(formData);
    if (!data.name) return { error: "Category name is required" };

    // Keep the slug in sync with the name — renaming a category in the
    // admin panel previously left its /shop/<slug> URL stuck on the old
    // name forever.
    if (before && before.name !== data.name) {
      data.slug = await uniqueSlug(slugify(data.name), id);
    }

    const category = await updateCategory(id, data);
    revalidatePath("/admin/categories");
    revalidatePath("/shop", "layout");
    if (before && before.slug !== category.slug) {
      revalidatePath(`/shop/${before.slug}`);
    }
    revalidatePath("/");
    return { ok: true, category };
  } catch (err) {
    return { error: err.message || "Failed to update category" };
  }
}

export async function deleteCategoryAction(id) {
  try {
    await requireFullAdminUser();
    const category = await getCategoryById(id);
    await deleteCategory(id);
    revalidatePath("/admin/categories");
    revalidatePath("/shop", "layout");
    if (category) revalidatePath(`/shop/${category.slug}`);
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Failed to delete category" };
  }
}
