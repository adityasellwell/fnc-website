"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertCircle, Loader2 } from "lucide-react";
import Table from "@/components/admin/Table";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { createVariantOptionAction, deleteVariantOptionAction } from "./actions";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

const TYPE_LABELS = { WEIGHT: "Weight", PIECES: "Pieces" };

export default function VariationOptionsClientPage({ initialOptions }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await createVariantOptionAction(formData);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Variation Options</h1>
        <p className="font-body text-sm text-slate mt-1">
          The reusable master list of Weight/Pieces values (e.g. &quot;250 g&quot;, &quot;4 pcs&quot;) that
          every product picks from when adding size/weight variations — set a value once here, use it on
          as many products as you want with a consistent name.
        </p>
      </div>

      <form onSubmit={handleAdd} className="bg-white border border-bordergray rounded-2xl p-4 flex flex-col sm:flex-row gap-3 mb-6">
        <select name="type" required className={`${inputClasses} sm:w-40`}>
          <option value="WEIGHT">Weight</option>
          <option value="PIECES">Pieces</option>
        </select>
        <input name="label" placeholder="e.g. 250 g" required className={`${inputClasses} sm:flex-1`} />
        <input name="order" type="number" placeholder="Sort order (optional)" className={`${inputClasses} sm:w-44`} />
        <button
          type="submit"
          disabled={loading}
          className="h-11 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Value
        </button>
      </form>

      {error && (
        <div className="p-3 bg-fnc-red/10 border border-fnc-red/20 rounded-xl text-fnc-red text-xs font-semibold flex items-center gap-2 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Table
        emptyMessage="No variation values yet — add one above."
        columns={[
          { header: "Type", accessor: (o) => TYPE_LABELS[o.type] || o.type },
          { header: "Label", accessor: (o) => <span className="font-semibold">{o.label}</span> },
          { header: "Sort Order", accessor: (o) => o.order },
          {
            header: "",
            className: "text-right",
            accessor: (o) => (
              <ConfirmDialog
                title="Delete this value?"
                description={`"${o.label}" will be removed. This only works if no product currently uses it.`}
                confirmLabel="Delete"
                onConfirm={() => deleteVariantOptionAction(o.id)}
                trigger={({ onClick }) => (
                  <button type="button" onClick={onClick} aria-label="Delete" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              />
            ),
          },
        ]}
        rows={initialOptions}
      />
    </div>
  );
}
