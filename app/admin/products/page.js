import { Plus, Pencil, Trash2 } from "lucide-react";
import Table from "@/components/admin/Table";
import Pagination from "@/components/admin/Pagination";
import Filters from "@/components/admin/Filters";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { listProducts } from "@/services/products";
import { listCategories } from "@/services/categories";
import { createProductAction, updateProductAction, deleteProductAction } from "./actions";

export const metadata = { title: "Products — Admin" };

export default async function AdminProductsPage({ searchParams }) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const [{ products, totalPages }, categories] = await Promise.all([
    listProducts({ search: sp.search || undefined, categoryId: sp.categoryId || undefined, page }),
    listCategories(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Products</h1>
        <ProductFormModal
          title="Add Product"
          categories={categories}
          action={createProductAction}
          trigger={({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              className="h-10 px-4 rounded-full bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          )}
        />
      </div>

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
          { header: "Price", accessor: (p) => `₹${Number(p.price).toFixed(0)}` },
          {
            header: "Stock",
            accessor: (p) => (
              <span className={p.stock <= 0 ? "text-fnc-red font-semibold" : ""}>{p.stock}</span>
            ),
          },
          { header: "Rating", accessor: (p) => `${p.rating.toFixed(1)} (${p.reviewCount})` },
          {
            header: "",
            className: "text-right",
            accessor: (p) => (
              <div className="flex items-center gap-2 justify-end">
                <ProductFormModal
                  title="Edit Product"
                  categories={categories}
                  product={p}
                  action={updateProductAction.bind(null, p.id)}
                  trigger={({ onClick }) => (
                    <button type="button" onClick={onClick} aria-label="Edit" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-charcoal hover:bg-warmwhite transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
                <ConfirmDialog
                  title="Delete this product?"
                  description={`"${p.name}" will be permanently removed.`}
                  confirmLabel="Delete"
                  onConfirm={() => deleteProductAction(p.id)}
                  trigger={({ onClick }) => (
                    <button type="button" onClick={onClick} aria-label="Delete" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
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
