import { z } from "zod";
import { NextResponse } from "next/server";
// Removed Clerk auth import
import Razorpay from "razorpay";
import { db } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getCurrentCustomer } from "@/lib/auth";
import { geocodeAddress } from "@/lib/utils/geocode";
import { getSettings } from "@/services/settings";
import { parseUserAgent } from "@/lib/utils/analytics";




/**
 * `customerId` is NEVER accepted from the client (that would let anyone
 * attach orders to, or read order history for, an arbitrary customer just
 * by guessing/knowing an id) — always derived server-side from the signed-
 * in session. Checkout requires an authenticated, email-verified account;
 * there is no guest checkout.
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

const createOrderSchema = z
  .object({
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
  const customer = await getCurrentCustomer();
  if (!customer) {
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

  const { items, fulfillmentType, storeId, deliveryAddress, couponCode } =
    parsed.data;

  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: "Please sign in (and verify your email) to place an order." },
        { status: 401 }
      );
    }
    const customerId = customer.id;

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

    const settings = await getSettings();
    let calculatedDistance = null;

    // Settings-driven Delivery Radius & Fees Enforcement
    if (fulfillmentType === "DELIVERY") {
      if (subtotal < Number(settings.minOrderValue)) {
        return NextResponse.json(
          { error: `Order subtotal must be at least ₹${settings.minOrderValue} for delivery.` },
          { status: 400 }
        );
      }

      const activeStore = await db.store.findFirst({
        where: { status: "ACTIVE", deliveryAvailable: true },
      });

      if (!activeStore) {
        return NextResponse.json(
          { error: "No active store found to handle delivery." },
          { status: 400 }
        );
      }

      const addressStr = `${deliveryAddress.line1}, ${deliveryAddress.line2 || ""}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.pincode}`;
      const coords = await geocodeAddress(addressStr);

      if (!coords) {
        return NextResponse.json(
          { error: "We couldn't verify this address. Please refine your address or choose Store Pickup." },
          { status: 400 }
        );
      }

      // Calculate Haversine distance
      const R = 6371; // Earth's radius in km
      const dLat = ((coords.lat - activeStore.latitude) * Math.PI) / 180;
      const dLon = ((coords.lng - activeStore.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((activeStore.latitude * Math.PI) / 180) *
          Math.cos((coords.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      if (distance > settings.deliveryRadiusKm) {
        return NextResponse.json(
          {
            error: `Your address is outside our delivery area of ${settings.deliveryRadiusKm} km. (Calculated distance: ${distance.toFixed(1)} km)`,
          },
          { status: 400 }
        );
      }

      calculatedDistance = distance;

      const deliveryCharge =
        subtotal >= Number(settings.freeDeliveryThreshold) ? 0 : Number(settings.deliveryCharge);
      total += deliveryCharge;
    }

    // Resolve client device, browser and IP address for analytics
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || null;
    const ua = request.headers.get("user-agent") || "";
    const { browser, device } = parseUserAgent(ua);

    let rzpOrder = null;
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      rzpOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // in paise
        currency: "INR",
        receipt: `rcpt_${Date.now().toString().slice(-10)}`,
      });
    } catch (rzpErr) {
      console.error("Razorpay order creation failed:", rzpErr);
      return NextResponse.json(
        { error: "Failed to initiate payment gateway. Please try again." },
        { status: 500 }
      );
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
          razorpayOrderId: rzpOrder.id,
          device,
          browser,
          ipAddress: ip,
          deliveryDistance: calculatedDistance,
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

      // Save a reusable Address row so /account's saved addresses list
      // actually populates, in addition to the immutable JSON snapshot on
      // the order itself. Every order is authenticated now, so no guest
      // branch is needed here.
      if (fulfillmentType === "DELIVERY") {
        const existing = await tx.address.findFirst({
          where: { customerId, line1: deliveryAddress.line1, pincode: deliveryAddress.pincode },
        });
        if (!existing) {
          await tx.address.create({
            data: { customerId, ...deliveryAddress },
          });
        }
      }

      // Log the order created event in PaymentAuditLog
      await tx.paymentAuditLog.create({
        data: {
          orderId: created.id,
          action: "ORDER_CREATED",
          status: "PENDING",
          amount: total,
          providerOrderId: rzpOrder.id,
          processingResult: "Razorpay order created and linked to local order successfully.",
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        data: order,
        razorpay: {
          orderId: rzpOrder.id,
          amount: rzpOrder.amount,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
        message: "Order placed successfully. Redirecting to payment...",
      },
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
