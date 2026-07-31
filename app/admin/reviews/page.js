import { listReviewsAdmin } from "@/services/reviews";
import ReviewsClientPage from "./ReviewsClientPage";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";

export const metadata = { title: "Reviews — Admin" };

export default async function AdminReviewsPage({ searchParams }) {
  const admin = await requireAdminUser();
  const storeId = getScopedStoreId(admin);
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { reviews, totalPages } = await listReviewsAdmin({ page, storeId: storeId || undefined });
  const serialized = JSON.parse(JSON.stringify(reviews));
  return <ReviewsClientPage reviews={serialized} page={page} totalPages={totalPages} searchParams={sp} />;
}
