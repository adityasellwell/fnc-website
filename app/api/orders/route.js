import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getOrCreateCustomerForClerkUser } from "@/lib/auth";

/**
 * `customerId` is NEVER accepted from the client (that would let anyone
 * attach orders to, or read order history for, an arbitrary customer just
 * by guessing/knowing an id). It's always derived server-side: from the
 * Clerk session if signed in, or from find-or-create-by-email guest
 * contact details if not.
 */

const addressSchema = z.object({
  line1: z.string().min(1, "line1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "city is required"),
  state: z.string().min(1, "state is required"),
  pincode: z.string().min(1, "pincode is required"),
});

const orderItemInputSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.coerce.number().int().positive("quantity must be a positive integer"),
});

// Guest checkout contact details — used to find-or-create a Customer row
// when there's no authenticated session. Ignored entirely if the request
// is authenticated (the session's own customer is used instead).
const guestSchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.string().email("a valid email is required"),
  phone: z.string().min(1, "phone is required"),
});

const createOrderSchema = z
  .object({
    guest: guestSchema.optional(),
    items: z.array(orderItemInputSchema).min(1, "At least one item is required"),
    fulfillmentType: z.enum(["DELIVERY", "PICKUP"]),
    storeId: z.string().min(1).optional(),
    deliveryAddress: addressSchema.optional(),
    couponCode: z.string().min(1).optional(),
  })
  .refine((data) => data.fulfillmentType !== "PICKUP" || Boolean(data.storeId), {
    message: "storeId is required when fulfillmentType is PICKUP",
    path: ["storeId"],
  })
  .refine(
    (data) => data.fulfillmentType !== "DELIVERY" || Boolean(data.deliveryAddress),
    {
      message: "deliveryAddress is required when fulfillmentType is DELIVERY",
      path: ["deliveryAddress"],
    }
  );

const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const parsed = listOrdersQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { page, pageSize } = parsed.data;

  try {
    const customer = await getOrCreateCustomerForClerkUser(userId);
    if (!customer) {
      return NextResponse.json({ data: [], pagination: { page, pageSize, totalCount: 0, totalPages: 1 } });
    }
    const customerId = customer.id;

    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where: { customerId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.order.count({ where: { customerId } }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize) || 1,
      },
    });
  } catch (err) {
    console.error("[GET /api/orders] failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.success) return rateLimitResponse();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { items, fulfillmentType, storeId, deliveryAddress, couponCode, guest } =
    parsed.data;

  try {
    const { userId } = await auth();
    let customerId;

    if (userId) {
      // Signed in — always use the session's own customer, never a
      // client-supplied one. Guest details in the body, if any, are ignored.
      const customer = await getOrCreateCustomerForClerkUser(userId);
      if (!customer) {
        return NextResponse.json(
          { error: "Unable to resolve your account. Please try again." },
          { status: 400 }
        );
      }
      customerId = customer.id;
    } else {
      if (!guest) {
        return NextResponse.json(
          { error: "Guest contact details are required when not signed in", issues: [{ path: ["guest"], message: "required" }] },
          { status: 400 }
        );
      }
      // Guest checkout — find-or-create by email (Customer.email is unique).
      // Reusing the same customer record across guest orders placed with
      // the same email keeps order history intact if they later sign in
      // with that same email (see lib/auth.js).
      const customer = await db.customer.upsert({
        where: { email: guest.email },
        update: { name: guest.name, phone: guest.phone },
        create: { name: guest.name, email: guest.email, phone: guest.phone },
      });
      customerId = customer.id;
    }

    if (fulfillmentType === "PICKUP") {
      const store = await db.store.findUnique({ where: { id: storeId } });
      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 400 });
      }
    }

    // Look up each product's CURRENT price server-side — a client-supplied
    // price is never trusted for the unitPrice/total calculation.
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    const productById = new Map(products.map((product) => [product.id, product]));
    const missingIds = productIds.filter((id) => !productById.has(id));
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: `Product(s) not found: ${missingIds.join(", ")}` },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const product = productById.get(item.productId);
      const unitPrice = product.price; // Prisma Decimal — snapshot at order time
      subtotal += Number(unitPrice) * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
      };
    });

    let total = subtotal;
    let coupon = null;

    if (couponCode) {
      coupon = await db.coupon.findUnique({ where: { code: couponCode } });

      if (!coupon || !coupon.active || coupon.expiryDate < new Date()) {
        return NextResponse.json(
          { error: "Invalid or expired coupon code" },
          { status: 400 }
        );
      }

      if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          { error: "This coupon has reached its usage limit" },
          { status: 400 }
        );
      }

      if (coupon.minOrderValue != null && subtotal < Number(coupon.minOrderValue)) {
        return NextResponse.json(
          { error: "Order does not meet the minimum value for this coupon" },
          { status: 400 }
        );
      }

      const discount =
        coupon.type === "PERCENT"
          ? subtotal * (Number(coupon.value) / 100)
          : Number(coupon.value);
      total = Math.max(0, subtotal - discount);
    }

    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerId,
          fulfillmentType,
          storeId: fulfillmentType === "PICKUP" ? storeId : null,
          deliveryAddress: fulfillmentType === "DELIVERY" ? deliveryAddress : null,
          couponCode: couponCode ?? null,
          total,
          items: { create: orderItemsData },
          statusHistory: { create: { status: "PLACED" } },
        },
        include: {
          items: { include: { product: true } },
          statusHistory: true,
        },
      });

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Save a reusable Address row for signed-in customers (skip guests —
      // no account for it to be useful in later) so /account's saved
      // addresses list actually populates, in addition to the immutable
      // JSON snapshot on the order itself.
      if (userId && fulfillmentType === "DELIVERY") {
        const existing = await tx.address.findFirst({
          where: { customerId, line1: deliveryAddress.line1, pincode: deliveryAddress.pincode },
        });
        if (!existing) {
          await tx.address.create({
            data: { customerId, ...deliveryAddress },
          });
        }
      }

      return created;
    });

    return NextResponse.json(
      { data: order, message: "Order placed successfully." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/orders] failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
