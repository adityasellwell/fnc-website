/**
 * Review data — backed by Prisma/Postgres.
 * Falls back to MOCK_REVIEWS when the DB is unreachable.
 */
import { db } from "@/lib/db";

const MOCK_REVIEWS = [
  {
    id: "rev-1",
    productId: null,
    storeId: "store-thane-west",
    rating: 5,
    comment: "Best fish store in Thane, hands down. The pomfret was incredibly fresh — you could tell it hadn't been sitting in ice for days.",
    authorName: "Priya Nair",
    createdAt: "2026-06-15T10:30:00.000Z",
  },
  {
    id: "rev-2",
    productId: null,
    storeId: "store-thane-west",
    rating: 5,
    comment: "The tandoori marinated chicken is a weeknight lifesaver. 30 minutes in the oven and dinner is sorted. My kids ask for it every Friday.",
    authorName: "Rohan Mehta",
    createdAt: "2026-06-20T14:00:00.000Z",
  },
  {
    id: "rev-3",
    productId: null,
    storeId: "store-thane-west",
    rating: 4,
    comment: "Really impressed with the packaging — vacuum-sealed and cold all the way to my door. The fish curry was delicious too!",
    authorName: "Kavitha Reddy",
    createdAt: "2026-06-22T09:15:00.000Z",
  },
  {
    id: "rev-4",
    productId: null,
    storeId: "store-thane-west",
    rating: 5,
    comment: "Ordered the mud crab — it arrived live and was perfect. The staff was really helpful about cleaning and cutting it the way I wanted.",
    authorName: "Arjun Sharma",
    createdAt: "2026-07-01T16:45:00.000Z",
  },
  {
    id: "rev-5",
    productId: null,
    storeId: "store-thane-west",
    rating: 5,
    comment: "F&C has changed how I buy protein. I used to go to the local market but the hygiene here is on another level. Highly recommended.",
    authorName: "Sunita Krishnamurthy",
    createdAt: "2026-07-05T11:20:00.000Z",
  },
  {
    id: "rev-6",
    productId: null,
    storeId: "store-thane-west",
    rating: 4,
    comment: "The boneless chicken breast quality is consistently excellent. Delivery is always on time and the cold packs actually work.",
    authorName: "Vikram Rao",
    createdAt: "2026-07-10T13:00:00.000Z",
  },
];

function mapReview(review) {
  return {
    id: review.id,
    productId: review.productId,
    storeId: review.storeId,
    rating: review.rating,
    comment: review.comment,
    authorName: review.authorName,
    createdAt: review.createdAt instanceof Date
      ? review.createdAt.toISOString()
      : review.createdAt,
  };
}

export async function getReviews() {
  try {
    const reviews = await db.review.findMany({
      orderBy: { createdAt: "desc" },
    });
    return reviews.map(mapReview);
  } catch {
    return MOCK_REVIEWS;
  }
}

export async function getReviewsForProduct(productId) {
  try {
    const reviews = await db.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
    return reviews.map(mapReview);
  } catch {
    return MOCK_REVIEWS.filter((r) => r.productId === productId);
  }
}

export async function getFeaturedReviews(limit = 6) {
  try {
    const reviews = await db.review.findMany({
      orderBy: { rating: "desc" },
      take: limit,
    });
    return reviews.map(mapReview);
  } catch {
    return MOCK_REVIEWS.slice(0, limit);
  }
}
