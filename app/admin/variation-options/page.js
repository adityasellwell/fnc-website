import { listVariantOptions } from "@/services/variantOptions";
import { requireFullAdminUser } from "@/lib/admin-auth";
import VariationOptionsClientPage from "./VariationOptionsClientPage";

export const metadata = { title: "Variation Options — Admin" };

export default async function AdminVariationOptionsPage() {
  await requireFullAdminUser();
  const options = await listVariantOptions();
  return <VariationOptionsClientPage initialOptions={JSON.parse(JSON.stringify(options))} />;
}
