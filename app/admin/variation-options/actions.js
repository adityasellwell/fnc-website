"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { createVariantOption, updateVariantOption, deleteVariantOption } from "@/services/variantOptions";

export async function createVariantOptionAction(formData) {
  try {
    await requireFullAdminUser();
    const type = formData.get("type")?.toString();
    const label = formData.get("label")?.toString().trim();
    const order = Number(formData.get("order")) || 0;
    if (!type || !label) return { error: "Type and label are required." };

    const created = await createVariantOption({ type, label, order });
    revalidatePath("/admin/products");
    // Returned so the caller (ProductFormModal's inline "Add New Value"
    // modal) can drop it straight into its dropdown without a page
    // reload — there's no standalone list page for this anymore.
    return { ok: true, option: JSON.parse(JSON.stringify(created)) };
  } catch (err) {
    if (err.code === "P2002") return { error: "This label already exists for that type." };
    return { error: err.message || "Failed to create." };
  }
}

export async function updateVariantOptionAction(id, formData) {
  try {
    await requireFullAdminUser();
    const type = formData.get("type")?.toString();
    const label = formData.get("label")?.toString().trim();
    const order = Number(formData.get("order")) || 0;
    if (!type || !label) return { error: "Type and label are required." };

    await updateVariantOption(id, { type, label, order });
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err) {
    if (err.code === "P2002") return { error: "This label already exists for that type." };
    return { error: err.message || "Failed to update." };
  }
}

export async function deleteVariantOptionAction(id) {
  try {
    await requireFullAdminUser();
    await deleteVariantOption(id);
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err) {
    return { error: err.message || "Failed to delete." };
  }
}
