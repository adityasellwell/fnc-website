import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { decrementStoreInventoryForOrder, incrementCouponUsageIfAny } from "@/services/orders";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      select: {
        id: true,
        paymentStatus: true,
        status: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isPaid = order.paymentStatus === "PAID" || order.status === "CONFIRMED";

    return NextResponse.json({
      success: isPaid,
      paymentStatus: order.paymentStatus,
      status: order.status,
    });
  } catch (err) {
    console.error("[GET /api/orders/[id]/verify-payment] failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    const order = await db.order.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If already paid, return success immediately
    if (order.paymentStatus === "PAID" || order.status === "CONFIRMED") {
      return NextResponse.json({ success: true });
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing Razorpay payment parameters" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (secret) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id || order.razorpayOrderId}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      });

      await decrementStoreInventoryForOrder(tx, order);
      await incrementCouponUsageIfAny(tx, order);

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "CONFIRMED",
        },
      });

      await tx.paymentAuditLog.create({
        data: {
          orderId: order.id,
          action: "CLIENT_PAYMENT_VERIFIED",
          status: "PAID",
          amount: order.total,
          eventId: razorpay_payment_id,
          processingResult: "Payment verified successfully via client callback.",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/orders/[id]/verify-payment] failed:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
