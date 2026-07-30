import { listProducts } from "@/services/products";
import { listCategories } from "@/services/categories";
import ProductsClientPage from "./ProductsClientPage";

export const metadata = { title: "Products — Admin" };

export default async function AdminProductsPage({ searchParams }) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const [{ products, totalPages }, categories] = await Promise.all([
    listProducts({ search: sp.search || undefined, categoryId: sp.categoryId || undefined, page }),
    listCategories(),
  ]);

  // Ensure decimals/dates are converted to strings for complete serialization
  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <ProductsClientPage
      initialProducts={serializedProducts}
      categories={serializedCategories}
      page={page}
      totalPages={totalPages}
      searchParams={sp}
    />
  );
}
