"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import {
  createDeliveryPartner,
  updateDeliveryPartner,
  deleteDeliveryPartner,
  resetDeliveryPartnerPin,
} from "@/services/delivery-partners";
import { db } from "@/lib/db";

async function assertPartnerAccess(admin, partnerId) {
  const scopedStoreId = getScopedStoreId(admin);
  if (!scopedStoreId) return;
  const partner = await db.deliveryPartner.findUnique({ where: { id: partnerId }, select: { storeId: true } });
  if (partner?.storeId !== scopedStoreId) throw new Error("Not authorized for this delivery partner");
}

export async function createDeliveryPartnerAction(formData) {
  const admin = await requireAdminUser();
  const scopedStoreId = getScopedStoreId(admin);
  const storeId = scopedStoreId || formData.get("storeId")?.toString();
  if (!storeId) throw new Error("Store is required");

  const { pin } = await createDeliveryPartner({
    name: formData.get("name")?.toString().trim(),
    phone: formData.get("phone")?.toString().trim(),
    storeId,
    vehicleType: formData.get("vehicleType")?.toString().trim(),
    vehicleNumber: formData.get("vehicleNumber")?.toString().trim(),
  });

  revalidatePath("/admin/delivery-partners");
  return { pin };
}

export async function updateDeliveryPartnerAction(id, formData) {
  const admin = await requireAdminUser();
  await assertPartnerAccess(admin, id);
  await updateDeliveryPartner(id, {
    name: formData.get("name")?.toString().trim(),
    vehicleType: formData.get("vehicleType")?.toString().trim(),
    vehicleNumber: formData.get("vehicleNumber")?.toString().trim(),
    status: formData.get("status")?.toString(),
    isActive: formData.get("isActive") === "on",
  });
  revalidatePath("/admin/delivery-partners");
}

export async function resetPartnerPinAction(id) {
  const admin = await requireAdminUser();
  await assertPartnerAccess(admin, id);
  const pin = await resetDeliveryPartnerPin(id);
  revalidatePath("/admin/delivery-partners");
  return { pin };
}

export async function deactivatePartnerAction(id) {
  const admin = await requireAdminUser();
  await assertPartnerAccess(admin, id);
  await deleteDeliveryPartner(id);
  revalidatePath("/admin/delivery-partners");
}
