import { listCoupons } from "@/services/coupons";
import CouponsClientPage from "./CouponsClientPage";
import { requireFullAdminUser } from "@/lib/admin-auth";

export const metadata = { title: "Coupons — Admin" };

export default async function AdminCouponsPage() {
  await requireFullAdminUser();
  const coupons = await listCoupons();
  // Stringify and parse decimals/dates to ensure complete JSON serialization before passing to Client Component
  const serializedCoupons = JSON.parse(JSON.stringify(coupons));

  return <CouponsClientPage initialCoupons={serializedCoupons} />;
}
