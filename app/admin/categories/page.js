import { Plus, Pencil, Trash2 } from "lucide-react";
import Table from "@/components/admin/Table";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import CategoryFormModal from "@/components/admin/CategoryFormModal";
import { listCategories } from "@/services/categories";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions";

export const metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Categories</h1>
        <CategoryFormModal
          title="Add Category"
          categories={categories}
          action={createCategoryAction}
          trigger={({ onClick }) => (
            <button type="button" onClick={onClick} className="h-10 px-4 rounded-full bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          )}
        />
      </div>

      <Table
        emptyMessage="No categories yet."
        columns={[
          { header: "Name", accessor: (c) => c.name },
          { header: "Slug", accessor: (c) => c.slug },
          { header: "Parent", accessor: (c) => c.parentCategory?.name ?? "—" },
          { header: "Products", accessor: (c) => c._count.products },
          { header: "Order", accessor: (c) => c.order },
          {
            header: "",
            className: "text-right",
            accessor: (c) => (
              <div className="flex items-center gap-2 justify-end">
                <CategoryFormModal
                  title="Edit Category"
                  categories={categories}
                  category={c}
                  action={updateCategoryAction.bind(null, c.id)}
                  trigger={({ onClick }) => (
                    <button type="button" onClick={onClick} aria-label="Edit" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-charcoal hover:bg-warmwhite transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
                <ConfirmDialog
                  title="Delete this category?"
                  description={
                    c._count.products > 0
                      ? `"${c.name}" has ${c._count.products} product(s) — deleting will fail until they're moved or removed.`
                      : `"${c.name}" will be permanently removed.`
                  }
                  confirmLabel="Delete"
                  onConfirm={() => deleteCategoryAction(c.id)}
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
        rows={categories}
      />
    </div>
  );
}
