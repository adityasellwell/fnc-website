import crypto from "crypto";
import { db } from "@/lib/db";

/**
 * Verifies Razorpay webhook signature.
 */
export function verifyWebhookSignature(body, signature, secret) {
  if (!signature || !secret) return false;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

/**
 * Creates an entry in the PaymentAuditLog table.
 */
export async function createPaymentAuditLog({
  orderId,
  action,
  status,
  amount,
  eventId = null,
  eventType = null,
  payload = null,
  signature = null,
  processingResult = null,
}) {
  return db.paymentAuditLog.create({
    data: {
      orderId,
      action,
      status,
      amount,
      eventId,
      eventType,
      payload: payload ? JSON.parse(JSON.stringify(payload)) : null,
      signature,
      processingResult,
    },
  });
}

/**
 * Calls the Razorpay Refund API to transfer money back to the customer.
 * MUST be called before marking any DB state as REFUNDED.
 * Throws on API failure — callers must NOT update DB if this throws.
 *
 * @param {string} razorpayPaymentId - Razorpay payment ID (pay_xxx)
 * @param {number} amountPaise - Refund amount in paise (₹ × 100)
 * @param {string} [notes] - Optional note shown in Razorpay dashboard
 * @returns {{ id: string, status: string }}
 */
export async function initiateRazorpayRefund(razorpayPaymentId, amountPaise, notes = "") {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // Dev/test — simulate success so the full flow can be tested end-to-end
    console.warn(
      `[Razorpay MOCK] Would refund ${amountPaise} paise for payment ${razorpayPaymentId}`
    );
    return { id: `mock_rfnd_${Date.now()}`, status: "processed" };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${razorpayPaymentId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        speed: "normal",
        notes: { reason: notes },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Razorpay Refund] API error ${response.status}: ${errorBody}`);
    throw new Error(`Razorpay refund API failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return { id: data.id, status: data.status };
}
