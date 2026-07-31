"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { createProduct, updateProduct, deleteProduct } from "@/services/products";
import { updateStoreStock } from "@/services/inventory";

function parseProductForm(formData) {
  const primaryImage = formData.get("image")?.toString().trim();
  const additionalVal = formData.get("additionalImages")?.toString().trim();
  const additionalImages = additionalVal
    ? additionalVal.split(",").map((i) => i.trim()).filter(Boolean)
    : [];
  const images = [primaryImage, ...additionalImages].filter(Boolean);
  const tags = formData.get("tags")?.toString().trim();

  return {
    slug: formData.get("slug").toString().trim(),
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
  };
}

export async function createProductAction(formData) {
  await requireAdminUser();
  const data = parseProductForm(formData);
  await createProduct({ ...data, nutrition: {} });
  revalidatePath("/admin/products");
}

export async function updateProductAction(id, formData) {
  await requireAdminUser();
  const data = parseProductForm(formData);
  await updateProduct(id, data);
  revalidatePath("/admin/products");
}

export async function deleteProductAction(id) {
  await requireAdminUser();
  await deleteProduct(id);
  revalidatePath("/admin/products");
}

export async function updateStoreStockAction(productId, storeId, stock) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin" && admin.storeId !== storeId) {
    throw new Error("Unauthorized");
  }
  await updateStoreStock(productId, storeId, stock, admin.id);
  revalidatePath("/admin/products");
}
