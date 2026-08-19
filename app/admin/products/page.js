import { listProducts } from "@/services/products";
import { listCategories } from "@/services/categories";
import { listVariantOptions } from "@/services/variantOptions";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import { getStores } from "@/lib/data/stores";
import ProductsClientPage from "./ProductsClientPage";

export const metadata = { title: "Products — Admin" };

export default async function AdminProductsPage({ searchParams }) {
  const admin = await requireAdminUser();
  const storeId = getScopedStoreId(admin);
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const [{ products, totalPages }, categories, stores, variantOptions] = await Promise.all([
    listProducts({ search: sp.search || undefined, categoryId: sp.categoryId || undefined, page }),
    listCategories(),
    getStores(),
    listVariantOptions(),
  ]);

  // Ensure decimals/dates are converted to strings for complete serialization
  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedStores = JSON.parse(JSON.stringify(stores));
  const serializedAdmin = JSON.parse(JSON.stringify(admin));
  const serializedVariantOptions = JSON.parse(JSON.stringify(variantOptions));

  return (
    <ProductsClientPage
      initialProducts={serializedProducts}
      categories={serializedCategories}
      stores={serializedStores}
      currentUser={serializedAdmin}
      variantOptions={serializedVariantOptions}
      page={page}
      totalPages={totalPages}
      searchParams={sp}
    />
  );
}
