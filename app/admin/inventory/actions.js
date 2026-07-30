"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { updateStock } from "@/services/products";

export async function updateStockAction(productId, stock) {
  await requireAdminUser();
  await updateStock(productId, Math.max(0, stock));
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}
