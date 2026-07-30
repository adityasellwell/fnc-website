"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { updateOrderStatus } from "@/services/orders";
import { getNextStatus } from "@/lib/orderStatus";

export async function advanceOrderStatusAction(orderId, currentStatus, fulfillmentType) {
  const admin = await requireAdminUser();
  const next = getNextStatus(currentStatus, fulfillmentType);
  if (!next) return;
  await updateOrderStatus(orderId, next, admin.id);
  revalidatePath("/admin/orders");
}

export async function cancelOrderAction(orderId) {
  const admin = await requireAdminUser();
  await updateOrderStatus(orderId, "CANCELLED", admin.id);
  revalidatePath("/admin/orders");
}
