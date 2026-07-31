import { listCategories } from "@/services/categories";
import CategoriesClientPage from "./CategoriesClientPage";
import { requireFullAdminUser } from "@/lib/admin-auth";

export const metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  await requireFullAdminUser();
  const categories = await listCategories();
  // Ensure date objects are converted to strings for complete serialization
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return <CategoriesClientPage initialCategories={serializedCategories} />;
}
