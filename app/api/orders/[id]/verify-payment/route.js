import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
