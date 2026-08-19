"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Plus, Trash2 } from "lucide-react";
import Modal from "./Modal";
import ImageUploadField from "./ImageUploadField";
import MultiImageUploadField from "./MultiImageUploadField";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

const textareaClasses =
  "w-full px-3.5 py-2.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors resize-none";

export default function ProductFormModal({ trigger, categories, product, action, title }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attributes, setAttributes] = useState(() =>
    Array.isArray(product?.customAttributes) ? product.customAttributes : []
  );

  function addAttribute() {
    setAttributes((cur) => [...cur, { label: "", value: "" }]);
  }
  function removeAttribute(idx) {
    setAttributes((cur) => cur.filter((_, i) => i !== idx));
  }
  function updateAttribute(idx, field, value) {
    setAttributes((cur) => cur.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  }

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
    setAttributes(Array.isArray(product?.customAttributes) ? product.customAttributes : []);
    setOpen(true);
  }

  return (
    <>
      {trigger({ onClick: handleOpen })}
      <Modal open={open} onClose={() => !loading && setOpen(false)} title={title} size="xl" description="Manage product details, pricing, and media.">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {error && (
            <div className="p-3 bg-fnc-red/10 border border-fnc-red/20 rounded-xl text-fnc-red text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Name <span className="text-fnc-red">*</span></label>
            <input name="name" defaultValue={product?.name} required className={inputClasses} />
            {product?.slug && (
              <p className="font-body text-xs text-slate mt-0.5">
                Page URL: <span className="font-mono text-charcoal bg-warmwhite px-1.5 py-0.5 rounded border border-bordergray">/product/{product.slug}</span>
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Category <span className="text-fnc-red">*</span></label>
              <select name="categoryId" defaultValue={product?.categoryId} required className={inputClasses}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Price (₹) <span className="text-fnc-red">*</span></label>
              <input name="price" type="number" step="0.01" defaultValue={product ? Number(product.price) : ""} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Unit <span className="text-fnc-red">*</span></label>
              <input name="unit" defaultValue={product?.unit} placeholder="500 g" required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Product Code / SKU</label>
              <input name="sku" defaultValue={product?.sku ?? ""} placeholder="e.g. FNC-FISH-001" className={inputClasses} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Description <span className="text-fnc-red">*</span></label>
            <textarea name="description" defaultValue={product?.description} rows={3} required className={`${textareaClasses} h-24`} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <ImageUploadField name="image" label="Primary Product Image" defaultValue={product?.images?.[0]} folder="products" />
            <div className="flex flex-col gap-3">
              <MultiImageUploadField
                name="additionalImages"
                label="Additional Gallery Images"
                defaultValue={product?.images ? product.images.slice(1) : []}
                folder="products"
              />
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs font-semibold text-charcoal">Product Video URL (Optional)</label>
                <input
                  name="videoUrl"
                  defaultValue={product?.media?.find((m) => m.type === "VIDEO")?.url || ""}
                  placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
                  className={inputClasses}
                />
              </div>
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
            <label className="font-body text-xs font-semibold text-charcoal">Nutrition Information (per serving, shown on the product page)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input name="nutritionCalories" defaultValue={product?.nutrition?.calories ?? ""} placeholder="Calories (e.g. 208)" className={inputClasses} />
              <input name="nutritionProtein" defaultValue={product?.nutrition?.protein ?? ""} placeholder="Protein (e.g. 20g)" className={inputClasses} />
              <input name="nutritionFat" defaultValue={product?.nutrition?.fat ?? ""} placeholder="Fat (e.g. 13g)" className={inputClasses} />
              <input name="nutritionCarbs" defaultValue={product?.nutrition?.carbs ?? ""} placeholder="Carbs (e.g. 0g)" className={inputClasses} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-body text-xs font-semibold text-charcoal">Custom Attributes (optional)</label>
              <button
                type="button"
                onClick={addAttribute}
                className="h-8 px-3 rounded-full border border-bordergray font-body text-xs font-semibold text-charcoal hover:border-fnc-red hover:text-fnc-red transition-colors flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Attribute
              </button>
            </div>
            <p className="font-body text-xs text-slate -mt-1">
              Add any extra detail worth showing on the product page — e.g. &quot;Origin of Fish&quot; → &quot;West Bengal&quot;, &quot;Cut Type&quot; → &quot;Fillet&quot;.
            </p>
            {attributes.length === 0 ? (
              <p className="font-body text-xs text-slate italic">No custom attributes added yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {attributes.map((attr, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      name="attribute_label"
                      value={attr.label}
                      onChange={(e) => updateAttribute(idx, "label", e.target.value)}
                      placeholder="Attribute name (e.g. Origin of Fish)"
                      className={`${inputClasses} min-w-0 flex-1`}
                    />
                    <input
                      name="attribute_value"
                      value={attr.value}
                      onChange={(e) => updateAttribute(idx, "value", e.target.value)}
                      placeholder="Value (e.g. West Bengal)"
                      className={`${inputClasses} min-w-0 flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => removeAttribute(idx)}
                      aria-label="Remove attribute"
                      className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {product ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
