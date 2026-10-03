"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import Modal from "./Modal";
import ImageUploadField from "./ImageUploadField";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

const textareaClasses =
  "w-full px-3.5 py-2.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors resize-none";

export default function CategoryFormModal({ trigger, categories, category, action, title }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState(category?.parentCategoryId ?? "");
  const [name, setName] = useState(category?.name ?? "");

  // Only top-level categories can be picked as a parent — letting a
  // subcategory itself be chosen as a parent (e.g. "Raw" under "Raw")
  // produced confusing, ambiguous nesting with no real benefit.
  const parentOptions = categories.filter((c) => !c.parentCategoryId && c.id !== category?.id);
  const selectedParent = parentOptions.find((c) => c.id === parentCategoryId);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const res = await action(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
    } catch (err) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setError("");
    setLoading(false);
    setOpen(true);
  }

  return (
    <>
      {trigger({ onClick: handleOpen })}
      <Modal open={open} onClose={() => !loading && setOpen(false)} title={title} size="md" description="Manage category details.">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {error && (
            <div className="p-3 bg-fnc-red/10 border border-fnc-red/20 rounded-xl text-fnc-red text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Name <span className="text-fnc-red">*</span></label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClasses}
            />
            {category?.slug && (
              <p className="font-body text-xs text-slate mt-0.5">
                Page URL: <span className="font-mono text-charcoal bg-warmwhite px-1.5 py-0.5 rounded border border-bordergray">/shop/{category.slug}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-fnc-red/20 bg-fnc-red/5">
            <label className="font-body text-xs font-semibold text-charcoal">
              Is this a subcategory of something? (e.g. &ldquo;Raw&rdquo; belongs under &ldquo;Chicken&rdquo;)
            </label>
            <select
              name="parentCategoryId"
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
              className={inputClasses}
            >
              <option value="">No — this is its own top-level category</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  Make it a subcategory of {c.name}
                </option>
              ))}
            </select>
            <p className="font-body text-xs font-semibold text-fnc-red mt-0.5">
              {selectedParent
                ? `This will be created as: ${selectedParent.name} → ${name || "(name)"}`
                : `This will be created as its own top-level category: ${name || "(name)"}`}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Description</label>
            <textarea name="description" defaultValue={category?.description} rows={2} className={`${textareaClasses} h-20`} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <ImageUploadField name="image" label="Category Image" defaultValue={category?.image} folder="categories" />
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Sort order</label>
              <input name="order" type="number" defaultValue={category?.order ?? 0} className={inputClasses} />
            </div>
          </div>
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-5 sm:-mb-6 mt-2 bg-white border-t border-bordergray px-4 sm:px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="h-11 px-4 font-body text-sm font-semibold text-charcoal hover:bg-warmwhite rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {category ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
