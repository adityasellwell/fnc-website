"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { createProduct, updateProduct, deleteProduct, getProductById } from "@/services/products";
import { updateStoreStock } from "@/services/inventory";
import { db } from "@/lib/db";

// Guards against exactly what happened with "F&C Surimi Fish Finger" being
// typed straight into the Slug field: the Slug input is gone from the admin
// form entirely now, and this always derives a clean URL-safe slug from the
// product Name instead.
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Appends -2, -3, ... until the slug is free — two products named the same
// thing ("F&C Chicken Nuggets 1000g" / "1500g" differ, but typos happen)
// would otherwise collide on the unique slug column.
async function uniqueSlug(base) {
  let slug = base || "product";
  let n = 2;
  while (await db.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function parseProductForm(formData) {
  const primaryImage = formData.get("image")?.toString().trim();
  const additionalVal = formData.get("additionalImages")?.toString().trim();
  const additionalImages = additionalVal
    ? additionalVal.split(",").map((i) => i.trim()).filter(Boolean)
    : [];
  const images = [primaryImage, ...additionalImages].filter(Boolean);
  const tags = formData.get("tags")?.toString().trim();
  const videoUrl = formData.get("videoUrl")?.toString().trim() || null;

  return {
    name: formData.get("name").toString().trim(),
    description: formData.get("description").toString().trim(),
    images,
    price: Number(formData.get("price")),
    unit: formData.get("unit").toString().trim(),
    stock: Number(formData.get("stock")) || 0,
    cookingInstructions: formData.get("cookingInstructions")?.toString().trim() ?? "",
    storageInstructions: formData.get("storageInstructions")?.toString().trim() ?? "",
    tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    categoryId: formData.get("categoryId").toString(),
    videoUrl,
  };
}

export async function createProductAction(formData) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin") {
    throw new Error("Unauthorized: Only super admins can create products");
  }
  const data = parseProductForm(formData);
  const slug = await uniqueSlug(slugify(data.name));
  const product = await createProduct({ ...data, slug, nutrition: {} });
  revalidatePath("/admin/products");
  revalidatePath("/shop", "layout");
  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/");
}

export async function updateProductAction(id, formData) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin") {
    throw new Error("Unauthorized: Only super admins can edit products");
  }
  const before = await getProductById(id);
  const data = parseProductForm(formData);
  const product = await updateProduct(id, data);
  revalidatePath("/admin/products");
  revalidatePath("/shop", "layout");
  revalidatePath(`/product/${product.slug}`);
  // Slug can change on edit (as it just did for the Surimi product) — the
  // old URL's cached render would otherwise keep serving stale content
  // indefinitely instead of 404ing once the slug no longer exists.
  if (before && before.slug !== product.slug) {
    revalidatePath(`/product/${before.slug}`);
  }
  revalidatePath("/");
}

export async function deleteProductAction(id) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin") {
    throw new Error("Unauthorized: Only super admins can delete products");
  }
  const product = await getProductById(id);
  await deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/shop", "layout");
  if (product) revalidatePath(`/product/${product.slug}`);
  revalidatePath("/");
}

export async function updateStoreStockAction(productId, storeId, stock) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin" && admin.storeId !== storeId) {
    throw new Error("Unauthorized");
  }
  await updateStoreStock(productId, storeId, stock, admin.id);
  revalidatePath("/admin/products");
}
