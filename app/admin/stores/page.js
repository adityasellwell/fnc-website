import { listStoresAdmin } from "@/services/stores";
import StoresClientPage from "./StoresClientPage";
import { requireFullAdminUser } from "@/lib/admin-auth";

export const metadata = { title: "Stores — Admin" };

export default async function AdminStoresPage() {
  await requireFullAdminUser();
  const stores = await listStoresAdmin();
  const serialized = JSON.parse(JSON.stringify(stores));
  return <StoresClientPage stores={serialized} />;
}
