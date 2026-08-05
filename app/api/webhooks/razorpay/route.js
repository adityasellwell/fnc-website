import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature, createPaymentAuditLog } from "@/services/payment";
import { sendOrderConfirmedEmail } from "@/lib/email";

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    console.error("[Razorpay Webhook] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventType = body.event;
  const eventId = body.id;
  const paymentEntity = body.payload?.payment?.entity;
  const razorpayOrderId = paymentEntity?.order_id;
  const razorpayPaymentId = paymentEntity?.id;
  const capturedAmountPaise = paymentEntity?.amount;

  if (!razorpayOrderId) {
    console.warn("[Razorpay Webhook] Webhook event received without razorpayOrderId:", eventType);
    return NextResponse.json({ message: "Ignored: No Razorpay Order ID" }, { status: 200 });
  }

  try {
    const order = await db.order.findUnique({
      where: { razorpayOrderId },
      include: { customer: true },
    });

    if (!order) {
      console.error("[Razorpay Webhook] Order not found for Razorpay Order ID:", razorpayOrderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency: check if this payment ID has already been recorded
    if (order.razorpayPaymentId === razorpayPaymentId) {
      console.log("[Razorpay Webhook] Webhook duplicate received. Already processed payment:", razorpayPaymentId);
      return NextResponse.json({ message: "Payment already processed (idempotent)" }, { status: 200 });
    }

    if (eventType === "payment.captured") {
      const orderTotalPaise = Math.round(Number(order.total) * 100);

      // Verify amount matches F&C Order.total exactly
      if (capturedAmountPaise !== orderTotalPaise) {
        console.error(
          `[Razorpay Webhook] Amount mismatch! Order total: ${orderTotalPaise} paise, Razorpay captured: ${capturedAmountPaise} paise`
        );
        await createPaymentAuditLog({
          orderId: order.id,
          action: "AMOUNT_MISMATCH",
          status: "FAILED",
          amount: order.total,
          eventId,
          eventType,
          payload: body,
          signature,
          processingResult: `Amount mismatch. Order: ${orderTotalPaise} paise. Razorpay: ${capturedAmountPaise} paise.`,
        });
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      await db.$transaction(async (tx) => {
        // Update Order fields
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            razorpayPaymentId,
            razorpaySignature: signature,
          },
        });

        // Log in status history
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: "CONFIRMED",
          },
        });

        // Log payment audit event
        await tx.paymentAuditLog.create({
          data: {
            orderId: order.id,
            action: "WEBHOOK_PAYMENT_CAPTURED",
            status: "PAID",
            amount: order.total,
            eventId,
            eventType,
            payload: JSON.parse(JSON.stringify(body)),
            signature,
            processingResult: "Payment verified and captured successfully via webhook.",
          },
        });
      });

      console.log(`[Razorpay Webhook] Order ${order.id} marked as PAID & CONFIRMED`);
      if (order.customer?.email) {
        sendOrderConfirmedEmail(order.customer, order);
      }
      return NextResponse.json({ message: "Payment processed successfully" }, { status: 200 });
    }

    if (eventType === "payment.failed") {
      const errorMsg = paymentEntity?.error_description || "Payment failed at checkout";

      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
          },
        });

        await tx.paymentAuditLog.create({
          data: {
            orderId: order.id,
            action: "WEBHOOK_PAYMENT_FAILED",
            status: "FAILED",
            amount: order.total,
            eventId,
            eventType,
            payload: JSON.parse(JSON.stringify(body)),
            signature,
            processingResult: `Payment failed: ${errorMsg}`,
          },
        });
      });

      console.log(`[Razorpay Webhook] Order ${order.id} payment failed recorded`);
      return NextResponse.json({ message: "Payment failure recorded" }, { status: 200 });
    }

    // Default response for other events
    return NextResponse.json({ message: `Webhook event ${eventType} ignored` }, { status: 200 });
  } catch (err) {
    console.error("[Razorpay Webhook] Exception occurred processing webhook:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
