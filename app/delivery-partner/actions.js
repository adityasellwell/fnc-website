"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentPartner, destroyPartnerSession } from "@/lib/delivery-partner-auth";
import { markOrderPickedUp, markOrderDelivered } from "@/services/orders";
import { checkDeliveryOtpRateLimit } from "@/lib/rate-limit";

export async function pickedUpAction(orderId) {
  const partner = await getCurrentPartner();
  if (!partner) throw new Error("Not signed in");
  await markOrderPickedUp(orderId, partner.id);
  revalidatePath("/delivery-partner/dashboard");
}

export async function deliveredAction(orderId, otp) {
  const partner = await getCurrentPartner();
  if (!partner) throw new Error("Not signed in");

  const limitRes = await checkDeliveryOtpRateLimit(orderId);
  if (!limitRes.success) {
    return { ok: false, error: "Too many incorrect attempts on this order. Please wait a few minutes and try again." };
  }

  try {
    await markOrderDelivered(orderId, partner.id, otp);
  } catch (err) {
    return { ok: false, error: err.message };
  }
  revalidatePath("/delivery-partner/dashboard");
  return { ok: true };
}

export async function partnerSignOutAction() {
  await destroyPartnerSession();
  redirect("/delivery-partner/sign-in");
}
