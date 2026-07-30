import { listStoresAdmin } from "@/services/stores";
import StoresClientPage from "./StoresClientPage";

export const metadata = { title: "Stores — Admin" };

export default async function AdminStoresPage() {
  const stores = await listStoresAdmin();
  const serialized = JSON.parse(JSON.stringify(stores));
  return <StoresClientPage stores={serialized} />;
}
