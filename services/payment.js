import crypto from "crypto";
import { db } from "@/lib/db";

/**
 * Verifies Razorpay webhook signature.
 * @param {string} body - The raw request body text.
 * @param {string} signature - The signature from X-Razorpay-Signature header.
 * @param {string} secret - The webhook secret.
 * @returns {boolean} True if signature is valid.
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
