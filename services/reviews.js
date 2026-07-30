import { db } from "@/lib/db";

const PAGE_SIZE = 20;

export async function listReviewsAdmin({ page = 1 } = {}) {
  const [reviews, totalCount] = await Promise.all([
    db.review.findMany({
      include: { product: { select: { name: true, slug: true } }, store: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.review.count(),
  ]);

  return { reviews, totalCount, totalPages: Math.ceil(totalCount / PAGE_SIZE) || 1 };
}

/**
 * Deletes a review and keeps Product.rating/reviewCount in sync — those
 * fields are denormalized (read directly by every product listing/detail
 * page, not computed live), so a deletion has to recompute them the same
 * way /api/reviews POST does when a review is added.
 */
export async function deleteReviewAdmin(id) {
  const review = await db.review.findUnique({ where: { id } });
  if (!review) return;

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
