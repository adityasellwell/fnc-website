import { listPromotions } from "@/services/promotions";
import CouponsClientPage from "./CouponsClientPage";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { getCategories } from "@/lib/data/categories";

export const metadata = { title: "Coupons — Admin" };

export default async function AdminCouponsPage() {
  await requireFullAdminUser();
  const [coupons, categories, products] = await Promise.all([
    listPromotions(),
    getCategories(),
    db.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  // Stringify and parse decimals/dates to ensure complete JSON serialization before passing to Client Component
  const serializedCoupons = JSON.parse(JSON.stringify(coupons));

  return <CouponsClientPage initialCoupons={serializedCoupons} categories={categories} products={products} />;
}
