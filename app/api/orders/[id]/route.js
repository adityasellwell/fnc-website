import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const ORDER_STATUS_VALUES = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "READY_FOR_PICKUP",
  "COLLECTED",
  "CANCELLED",
  "REFUNDED",
];

const updateStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES, {
    message: `status must be one of: ${ORDER_STATUS_VALUES.join(", ")}`,
  }),
  // Placeholder until Clerk-derived User.id is available for
  // OrderStatusHistory.changedById — optional for now, not required.
  changedById: z.string().min(1).optional(),
});

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        statusHistory: { orderBy: { timestamp: "asc" } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (err) {
    console.error(`[GET /api/orders/${id}] failed:`, err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// TODO: gate this to admin/store_manager once Clerk roles exist (Phase
// 6/8) — right now anyone can call this, there's no auth in the app yet.
export async function PATCH(request, { params }) {
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.success) return rateLimitResponse();

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { status, changedById } = parsed.data;

  try {
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          changedById: changedById ?? null,
        },
      });

      // Re-fetch within the same transaction so the returned payload
      // includes the status-history row just created above.
      return tx.order.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          statusHistory: { orderBy: { timestamp: "asc" } },
        },
      });
    });

    return NextResponse.json({
      data: order,
      message: "Order status updated successfully.",
    });
  } catch (err) {
    console.error(`[PATCH /api/orders/${id}] failed:`, err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
