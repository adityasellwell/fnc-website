"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import {
  updateOrderStatus,
  updateOrderPackingNotes,
  assignDeliveryPartner,
  createOrderRefund,
  getOrderStoreId,
} from "@/services/orders";
import { getNextStatus } from "@/lib/orderStatus";

// Defense in depth: a Store Admin/staff can only mutate orders belonging
// to their own store, even if a request is crafted with another store's
// orderId — matches the notFound() scoping already enforced on the
// /admin/orders/[id] page view.
async function assertOrderAccess(admin, orderId) {
  const scopedStoreId = getScopedStoreId(admin);
  if (!scopedStoreId) return; // super admin — unrestricted
  const orderStoreId = await getOrderStoreId(orderId);
  if (orderStoreId !== scopedStoreId) notFound();
}

export async function advanceOrderStatusAction(orderId, currentStatus, fulfillmentType) {
  const admin = await requireAdminUser();
  await assertOrderAccess(admin, orderId);
  const next = getNextStatus(currentStatus, fulfillmentType);
  if (!next) return;
  await updateOrderStatus(orderId, next, admin.id);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function cancelOrderAction(orderId) {
  const admin = await requireAdminUser();
  await assertOrderAccess(admin, orderId);
  await updateOrderStatus(orderId, "CANCELLED", admin.id);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updatePackingNotesAction(orderId, notes) {
  const admin = await requireAdminUser();
  await assertOrderAccess(admin, orderId);
  await updateOrderPackingNotes(orderId, notes?.toString().trim() || "", admin.id);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function assignDeliveryPartnerAction(orderId, partnerId) {
  const admin = await requireAdminUser();
  await assertOrderAccess(admin, orderId);
  await assignDeliveryPartner(orderId, partnerId, admin.id);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function createRefundAction(orderId, amount, reason) {
  const admin = await requireAdminUser();
  await assertOrderAccess(admin, orderId);
  await createOrderRefund(orderId, Number(amount), reason?.toString().trim() || "", admin.id);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
