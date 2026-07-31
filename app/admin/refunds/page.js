import { listRefundRequests } from "@/services/refunds";
import { requireFullAdminUser } from "@/lib/admin-auth";
import RefundsClientPage from "./RefundsClientPage";

export const metadata = { title: "Refunds — Admin" };

export default async function AdminRefundsPage() {
  await requireFullAdminUser();
  const refunds = await listRefundRequests();
  const serialized = JSON.parse(JSON.stringify(refunds));
  return <RefundsClientPage refunds={serialized} />;
}
