import { db } from "@/lib/db";

const PAGE_SIZE = 10;

export async function listReviewsAdmin({ page = 1, storeId } = {}) {
  const where = storeId
    ? {
        OR: [
          { storeId },
          { product: { availableAtStores: { some: { id: storeId } } } },
        ],
      }
    : {};

  const [reviews, totalCount] = await Promise.all([
    db.review.findMany({
      where,
      include: { product: { select: { name: true, slug: true } }, store: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.review.count({ where }),
  ]);

  return { reviews, totalCount, totalPages: Math.ceil(totalCount / PAGE_SIZE) || 1 };
}

/**
 * Deletes a review and keeps Product.rating/reviewCount in sync — those
 * fields are denormalized (read directly by every product listing/detail
 * page, not computed live), so a deletion has to recompute them the same
 * way /api/reviews POST does when a review is added.
 */
export async function deleteReviewAdmin(id, storeId) {
  const review = await db.review.findUnique({
    where: { id },
    include: { product: { include: { availableAtStores: true } } },
  });
  if (!review) return;

  if (storeId) {
    const isStoreReview = review.storeId === storeId;
    const isProductReviewAtStore =
      review.product && review.product.availableAtStores.some((s) => s.id === storeId);
    if (!isStoreReview && !isProductReviewAtStore) {
      throw new Error("Unauthorized");
    }
  }

  await db.review.delete({ where: { id } });

  if (review.productId) {
    const agg = await db.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await db.product.update({
      where: { id: review.productId },
      data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
    });
  }
}
