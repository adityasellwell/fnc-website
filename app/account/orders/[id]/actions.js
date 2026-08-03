"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCustomer } from "@/lib/auth";
import { cancelOrder, getOrderById } from "@/services/orders";
import { createRefundRequest, cancelRefundRequest } from "@/services/refunds";
import {
  sendOrderCancelledEmail,
  sendRefundRequestConfirmation,
} from "@/lib/email";

/**
 * Customer cancels their order.
 * Only valid for PLACED or CONFIRMED orders.
 * Automatically triggers a Razorpay refund if payment was already captured.
 */
export async function cancelOrderAction(orderId) {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "Not authenticated" };

  try {
    const result = await cancelOrder(orderId, customer.id);
    // Non-blocking email notification
    sendOrderCancelledEmail(customer, result, !!result.razorpayRefundId);
    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath("/account");
    return { ok: true, wasRefunded: !!result.razorpayRefundId };
  } catch (err) {
    console.error("[cancelOrderAction]", err);
    return { ok: false, error: err.message || "Failed to cancel order" };
  }
}

/**
 * Customer submits a refund request.
 * Only valid after kitchen has started. Subject to 24h window after delivery.
 */
export async function requestRefundAction(orderId, formData) {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "Not authenticated" };

  const category = formData.get?.("category") ?? formData.category;
  const reason = formData.get?.("reason") ?? formData.reason;
  const photoUrl = formData.get?.("photoUrl") ?? formData.photoUrl ?? null;

  if (!category) return { ok: false, error: "Please select a reason category" };
  if (!reason || reason.trim().length < 10) {
    return { ok: false, error: "Please provide more details (at least 10 characters)" };
  }

  try {
    await createRefundRequest({
      orderId,
      customerId: customer.id,
      category,
      reason: reason.trim(),
      photoUrl,
    });

    // Non-blocking email
    const order = await getOrderById(orderId);
    if (order && customer.email) {
      sendRefundRequestConfirmation(customer, order);
    }

    revalidatePath(`/account/orders/${orderId}`);
    return { ok: true };
  } catch (err) {
    console.error("[requestRefundAction]", err);
    return { ok: false, error: err.message || "Failed to submit refund request" };
  }
}

/**
 * Customer withdraws a PENDING refund request.
 */
export async function cancelRefundRequestAction(refundRequestId, orderId) {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "Not authenticated" };

  try {
    await cancelRefundRequest(refundRequestId, customer.id);
    revalidatePath(`/account/orders/${orderId}`);
    return { ok: true };
  } catch (err) {
    console.error("[cancelRefundRequestAction]", err);
    return { ok: false, error: err.message || "Failed to cancel refund request" };
  }
}
