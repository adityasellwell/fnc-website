import Table from "@/components/admin/Table";
import Pagination from "@/components/admin/Pagination";
import Filters from "@/components/admin/Filters";
import StockAdjuster from "@/components/admin/StockAdjuster";
import { listProducts } from "@/services/products";
import { listCategories } from "@/services/categories";

export const metadata = { title: "Inventory — Admin" };

export default async function AdminInventoryPage({ searchParams }) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const [{ products, totalPages }, categories] = await Promise.all([
    listProducts({ search: sp.search || undefined, categoryId: sp.categoryId || undefined, page }),
    listCategories(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-6">Inventory</h1>
      <p className="font-body text-sm text-slate mb-5">
        Quick stock adjustments — for everything else (price, description, images), edit the
        product directly under Products.
      </p>

      <Filters
        fields={[
          { key: "search", label: "Search products", type: "search" },
          {
            key: "categoryId",
            label: "Category",
            type: "select",
            options: categories.map((c) => ({ value: c.id, label: c.name })),
          },
        ]}
      />

      <Table
        emptyMessage="No products match these filters."
        columns={[
          { header: "Name", accessor: (p) => p.name },
          { header: "Category", accessor: (p) => p.category.name },
          { header: "Unit", accessor: (p) => p.unit },
          {
            header: "Stock",
            className: "text-right",
            accessor: (p) => (
              <div className="flex justify-end">
                <StockAdjuster productId={p.id} stock={p.stock} />
              </div>
            ),
          },
        ]}
        rows={products}
      />

      <Pagination page={page} totalPages={totalPages} searchParams={sp} />
    </div>
  );
}
