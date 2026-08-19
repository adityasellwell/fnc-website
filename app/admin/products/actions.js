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

  const nutrition = {
    calories: formData.get("nutritionCalories")?.toString().trim() || null,
    protein: formData.get("nutritionProtein")?.toString().trim() || null,
    fat: formData.get("nutritionFat")?.toString().trim() || null,
    carbs: formData.get("nutritionCarbs")?.toString().trim() || null,
  };

  const attrLabels = formData.getAll("attribute_label").map((v) => v.toString().trim());
  const attrValues = formData.getAll("attribute_value").map((v) => v.toString().trim());
  const customAttributes = attrLabels
    .map((label, i) => ({ label, value: attrValues[i] || "" }))
    .filter((a) => a.label && a.value);

  // Empty string, not null, would violate the unique constraint the
  // moment a second product is also left without a SKU.
  const sku = formData.get("sku")?.toString().trim() || null;

  return {
    name: formData.get("name").toString().trim(),
    description: formData.get("description").toString().trim(),
    images,
    price: Number(formData.get("price")),
    unit: formData.get("unit").toString().trim(),
    stock: Number(formData.get("stock")) || 0,
    sku,
    cookingInstructions: formData.get("cookingInstructions")?.toString().trim() ?? "",
    storageInstructions: formData.get("storageInstructions")?.toString().trim() ?? "",
    tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    categoryId: formData.get("categoryId").toString(),
    videoUrl,
    nutrition,
    customAttributes: customAttributes.length > 0 ? customAttributes : null,
  };
}

export async function createProductAction(formData) {
  try {
    const admin = await requireAdminUser();
    if (admin.role.name !== "admin") {
      return { error: "Unauthorized: Only super admins can create products" };
    }
    const data = parseProductForm(formData);
    if (!data.name) return { error: "Product name is required" };
    if (!data.categoryId) return { error: "Category is required" };
    if (isNaN(data.price) || data.price < 0) return { error: "Valid price is required" };

    const slug = await uniqueSlug(slugify(data.name));
    const product = await createProduct({ ...data, slug });
    revalidatePath("/admin/products");
    revalidatePath("/shop", "layout");
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/");
    return { ok: true, product };
  } catch (err) {
    if (err.code === "P2002" && err.meta?.target?.includes("sku")) {
      return { error: "That SKU is already used by another product — each SKU must be unique." };
    }
    return { error: err.message || "Failed to create product" };
  }
}

export async function updateProductAction(id, formData) {
  try {
    const admin = await requireAdminUser();
    if (admin.role.name !== "admin") {
      return { error: "Unauthorized: Only super admins can edit products" };
    }
    const before = await getProductById(id);
    const data = parseProductForm(formData);
    if (!data.name) return { error: "Product name is required" };
    if (!data.categoryId) return { error: "Category is required" };
    if (isNaN(data.price) || data.price < 0) return { error: "Valid price is required" };

    const product = await updateProduct(id, data);
    revalidatePath("/admin/products");
    revalidatePath("/shop", "layout");
    revalidatePath(`/product/${product.slug}`);
    if (before && before.slug !== product.slug) {
      revalidatePath(`/product/${before.slug}`);
    }
    revalidatePath("/");
    return { ok: true, product };
  } catch (err) {
    if (err.code === "P2002" && err.meta?.target?.includes("sku")) {
      return { error: "That SKU is already used by another product — each SKU must be unique." };
    }
    return { error: err.message || "Failed to update product" };
  }
}

export async function deleteProductAction(id) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin") {
    return { error: "Unauthorized: Only super admins can delete products" };
  }
  const product = await getProductById(id);
  try {
    await deleteProduct(id);
  } catch (err) {
    return { error: err.message };
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop", "layout");
  if (product) revalidatePath(`/product/${product.slug}`);
  revalidatePath("/");
  return { ok: true };
}

export async function updateStoreStockAction(productId, storeId, stock) {
  try {
    const admin = await requireAdminUser();
    if (admin.role.name !== "admin" && admin.storeId !== storeId) {
      return { error: "Unauthorized" };
    }
    await updateStoreStock(productId, storeId, stock, admin.id);
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Failed to update stock" };
  }
}
