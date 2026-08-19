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
import { getNearestActiveStore } from "@/lib/data/stores";
import { haversineDistanceKm } from "@/lib/utils/geo";




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
  // Which variant (e.g. "500 g") was selected, if the product has any —
  // the PRICE for it is never trusted from the client, only this label,
  // resolved to a real ProductVariant row server-side below.
  variantLabel: z.string().min(1).optional(),
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
    // price is never trusted for the unitPrice/total calculation. Includes
    // variants so a selected variant's own price can be resolved the same
    // trusted way, from its label only (never a client-sent price/amount).
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: { include: { variantOption: true } } },
    });

    const productById = new Map(products.map((product) => [product.id, product]));
    const missingIds = productIds.filter((id) => !productById.has(id));
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: `Product(s) not found: ${missingIds.join(", ")}` },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.variantLabel) continue;
      const product = productById.get(item.productId);
      const match = product.variants.find((v) => v.variantOption.label === item.variantLabel);
      if (!match) {
        return NextResponse.json(
          { error: `"${item.variantLabel}" isn't a valid option for ${product.name}.` },
          { status: 400 }
        );
      }
    }

    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const product = productById.get(item.productId);
      const variantMatch = item.variantLabel
        ? product.variants.find((v) => v.variantOption.label === item.variantLabel)
        : null;
      const unitPrice = variantMatch ? variantMatch.price : product.price; // Prisma Decimal — snapshot at order time
      subtotal += Number(unitPrice) * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        variantLabel: item.variantLabel || null,
      };
    });

    let total = subtotal;
    let coupon = null;

    if (couponCode) {
      coupon = await db.promotion.findUnique({
        where: { code: couponCode },
        include: { scopeProducts: { select: { id: true } } },
      });

      const now = new Date();
      const isExpired = coupon?.endsAt && coupon.endsAt < now;
      const isNotStartedYet = coupon?.startsAt && coupon.startsAt > now;
      if (!coupon || !coupon.active || isExpired || isNotStartedYet) {
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

      // The discount previously always applied to the FULL cart subtotal,
      // completely ignoring appliesTo/scopeProducts/scopeCategoryId — a
      // coupon scoped to one product discounted the whole cart. Only the
      // portion of the subtotal that's actually in scope is discountable
      // now; anything outside scope is charged at full price.
      let discountableAmount = subtotal;
      if (coupon.appliesTo === "PRODUCT") {
        const scopedIds = new Set(coupon.scopeProducts.map((p) => p.id));
        discountableAmount = orderItemsData.reduce(
          (sum, item) => (scopedIds.has(item.productId) ? sum + Number(item.unitPrice) * item.quantity : sum),
          0
        );
      } else if (coupon.appliesTo === "CATEGORY" && coupon.scopeCategoryId) {
        discountableAmount = orderItemsData.reduce((sum, item) => {
          const product = productById.get(item.productId);
          return product?.categoryId === coupon.scopeCategoryId ? sum + Number(item.unitPrice) * item.quantity : sum;
        }, 0);
      }

      if ((coupon.appliesTo === "PRODUCT" || coupon.appliesTo === "CATEGORY") && discountableAmount === 0) {
        return NextResponse.json(
          { error: "This coupon doesn't apply to any items in your cart" },
          { status: 400 }
        );
      }

      const discount =
        coupon.discountType === "PERCENT"
          ? discountableAmount * (Number(coupon.value) / 100)
          : coupon.discountType === "FLAT"
          ? Math.min(Number(coupon.value), discountableAmount)
          : 0; // BOGO discounts aren't computed as a flat cart discount here
      total = Math.max(0, subtotal - discount);
    }

    const settings = await getSettings();
    let calculatedDistance = null;
    let deliveryStoreId = null;
    let deliveryCoords = null;

    // Settings-driven Delivery Radius & Fees Enforcement
    if (fulfillmentType === "DELIVERY") {
      if (subtotal < Number(settings.minOrderValue)) {
        return NextResponse.json(
          { error: `Order subtotal must be at least ₹${settings.minOrderValue} for delivery.` },
          { status: 400 }
        );
      }

      const addressStr = `${deliveryAddress.line1}, ${deliveryAddress.line2 || ""}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.pincode}`;
      const coords = await geocodeAddress(addressStr, {
        line1: deliveryAddress.line1,
        line2: deliveryAddress.line2,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
      });

      if (!coords) {
        return NextResponse.json(
          { error: "We couldn't verify this address. Please refine your address or choose Store Pickup." },
          { status: 400 }
        );
      }

      const nearest = await getNearestActiveStore(coords.lat, coords.lng, { deliveryOnly: true });

      if (!nearest) {
        return NextResponse.json(
          { error: "No active store found to handle delivery." },
          { status: 400 }
        );
      }

      const distance = haversineDistanceKm(coords.lat, coords.lng, nearest.store.geo.lat, nearest.store.geo.lng);

      if (distance > settings.deliveryRadiusKm) {
        return NextResponse.json(
          {
            error: `Your address is outside our delivery area of ${settings.deliveryRadiusKm} km. (Calculated distance: ${distance.toFixed(1)} km)`,
          },
          { status: 400 }
        );
      }

      calculatedDistance = distance;
      deliveryStoreId = nearest.store.id;
      deliveryCoords = coords;

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
          storeId: fulfillmentType === "PICKUP" ? storeId : deliveryStoreId,
          deliveryAddress: fulfillmentType === "DELIVERY" ? deliveryAddress : null,
          latitude: deliveryCoords?.lat ?? null,
          longitude: deliveryCoords?.lng ?? null,
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
        await tx.promotion.update({
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
          eventId: rzpOrder.id,
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
