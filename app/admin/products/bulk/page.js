import { requireAdminUser } from "@/lib/admin-auth";
import { listCategories } from "@/services/categories";
import BulkClientPage from "./BulkClientPage";

export const metadata = { title: "Bulk Import/Export — Admin" };

export default async function AdminProductsBulkPage() {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin") {
    return <p className="font-body text-sm text-slate">Only super admins can bulk import/export products.</p>;
  }

  const categories = await listCategories();
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return <BulkClientPage categories={serializedCategories} />;
}
