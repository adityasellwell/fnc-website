import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getCurrentCustomer } from "@/lib/auth";

// `authorName` is deliberately NOT accepted here — a review's displayed
// name always comes from the signed-in customer's real account (see
// POST below), never a client-supplied string. Anyone could otherwise
// post a review under any name they typed, which is exactly what made
// this endpoint not "legit" before.
const createReviewSchema = z
  .object({
    productId: z.string().min(1).optional(),
    storeId: z.string().min(1).optional(),
    orderId: z.string().min(1).optional(),
    rating: z.coerce.number().int().min(1, "rating must be between 1 and 5").max(5, "rating must be between 1 and 5"),
    comment: z.string().min(1, "comment is required").max(5000),
  })
  .refine((data) => Boolean(data.productId) !== Boolean(data.storeId), {
    message: "Exactly one of productId or storeId must be provided",
    path: ["productId"],
  });

// An order is only "reviewable" once it has actually reached the
// customer — matches the terminal statuses used for the refund window
// elsewhere (see canRequestRefund in OrderActions.js).
const REVIEWABLE_ORDER_STATUSES = ["DELIVERED", "COLLECTED"];

const listReviewsQuerySchema = z
  .object({
    productId: z.string().min(1).optional(),
    storeId: z.string().min(1).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .refine((data) => Boolean(data.productId) !== Boolean(data.storeId), {
    message: "Provide exactly one of productId or storeId",
    path: ["productId"],
  });

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const parsed = listReviewsQuerySchema.safeParse({
    productId: searchParams.get("productId") ?? undefined,
    storeId: searchParams.get("storeId") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { productId, storeId, page, pageSize } = parsed.data;
  const where = productId ? { productId } : { storeId };

  try {
    const [reviews, totalCount] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.review.count({ where }),
    ]);

    return NextResponse.json({
      data: reviews,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize) || 1,
      },
    });
  } catch (err) {
    console.error("[GET /api/reviews] failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const rateLimit = await checkRateLimit(request);
  if (!rateLimit.success) return rateLimitResponse();

  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json(
      { error: "Please sign in (and verify your email) to leave a review." },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { productId, storeId, orderId, rating, comment } = parsed.data;

  try {
    // A product review tied to an order must be a real, delivered
    // purchase belonging to this customer — otherwise anyone signed in
    // could review any product with no purchase at all.
    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: { customerId: true, status: true, items: { select: { productId: true } } },
      });
      if (!order || order.customerId !== customer.id) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      if (!REVIEWABLE_ORDER_STATUSES.includes(order.status)) {
        return NextResponse.json(
          { error: "You can review this order's items once it's delivered." },
          { status: 403 }
        );
      }
      if (productId && !order.items.some((item) => item.productId === productId)) {
        return NextResponse.json(
          { error: "This product wasn't part of that order." },
          { status: 400 }
        );
      }
    }

    const existing = await db.review.findFirst({
      where: orderId
        ? { customerId: customer.id, productId: productId ?? null, storeId: storeId ?? null, orderId }
        : { customerId: customer.id, productId: productId ?? null, storeId: storeId ?? null },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You've already reviewed this — edit or delete your existing review instead." },
        { status: 409 }
      );
    }

    const review = await db.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          rating,
          comment,
          authorName: customer.name,
          customerId: customer.id,
          productId: productId ?? null,
          storeId: storeId ?? null,
          orderId: orderId ?? null,
        },
      });

      // Keep Product.rating/reviewCount in sync so listing/detail pages
      // (which read the denormalized fields, not a live aggregate) stay
      // accurate. Store has no equivalent aggregate fields in the schema.
      if (productId) {
        const agg = await tx.review.aggregate({
          where: { productId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            rating: agg._avg.rating ?? 0,
            reviewCount: agg._count.rating,
          },
        });
      }

      return created;
    });

    return NextResponse.json(
      { data: review, message: "Review submitted successfully." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/reviews] failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
