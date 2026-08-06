import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import { listDeliveryPartners } from "@/services/delivery-partners";
import { listStoresAdmin } from "@/services/stores";
import DeliveryPartnersClientPage from "./DeliveryPartnersClientPage";

export const metadata = { title: "Delivery — Admin" };

export default async function AdminDeliveryPartnersPage() {
  const admin = await requireAdminUser();
  const scopedStoreId = getScopedStoreId(admin);

  const [partners, stores] = await Promise.all([
    listDeliveryPartners(scopedStoreId),
    scopedStoreId ? Promise.resolve([]) : listStoresAdmin(),
  ]);

  return (
    <DeliveryPartnersClientPage
      partners={JSON.parse(JSON.stringify(partners))}
      stores={JSON.parse(JSON.stringify(stores))}
      scopedStoreId={scopedStoreId}
    />
  );
}
