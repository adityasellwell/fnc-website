"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";
import ImageUploadField from "./ImageUploadField";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

function SubmitButton({ label }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center gap-2"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}

export default function ProductFormModal({ trigger, categories, product, action, title }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <>
      {trigger({ onClick: () => setOpen(true) })}
      <Modal open={open} onClose={() => setOpen(false)} title={title} maxWidth="max-w-2xl">
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Name</label>
              <input name="name" defaultValue={product?.name} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Slug</label>
              <input name="slug" defaultValue={product?.slug} required className={inputClasses} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Category</label>
              <select name="categoryId" defaultValue={product?.categoryId} required className={inputClasses}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Price (₹)</label>
              <input name="price" type="number" step="0.01" defaultValue={product ? Number(product.price) : ""} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Unit</label>
              <input name="unit" defaultValue={product?.unit} placeholder="500 g" required className={inputClasses} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Description</label>
            <textarea name="description" defaultValue={product?.description} rows={3} required className={`${inputClasses} h-auto py-2.5 resize-none`} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <ImageUploadField name="image" label="Primary Product Image" defaultValue={product?.images?.[0]} folder="products" />
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Additional Gallery Images (comma-separated URLs)</label>
              <input
                name="additionalImages"
                defaultValue={product?.images ? product.images.slice(1).join(", ") : ""}
                placeholder="https://img1.jpg, https://img2.jpg"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Global Base Stock (compatibility fallback)</label>
            <input name="stock" type="number" defaultValue={product?.stock ?? 0} required className={inputClasses} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Cooking Instructions</label>
              <input name="cookingInstructions" defaultValue={product?.cookingInstructions} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Storage Instructions</label>
              <input name="storageInstructions" defaultValue={product?.storageInstructions} className={inputClasses} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Tags (comma separated)</label>
            <input
              name="tags"
              defaultValue={Array.isArray(product?.tags) ? product.tags.join(", ") : ""}
              placeholder="bestseller, boneless"
              className={inputClasses}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-4 font-body text-sm font-semibold text-charcoal hover:bg-warmwhite rounded-xl transition-colors">
              Cancel
            </button>
            <SubmitButton label={product ? "Save Changes" : "Create Product"} />
          </div>
        </form>
      </Modal>
    </>
  );
}
