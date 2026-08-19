"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Plus, Trash2, X } from "lucide-react";
import Modal from "./Modal";
import ImageUploadField from "./ImageUploadField";
import MultiImageUploadField from "./MultiImageUploadField";
import { createVariantOptionAction } from "@/app/admin/variation-options/actions";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

const textareaClasses =
  "w-full px-3.5 py-2.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors resize-none";

const VARIANT_TYPE_LABELS = { WEIGHT: "Weight", PIECES: "Pieces" };

function initialVariantRows(product) {
  if (!Array.isArray(product?.variants) || product.variants.length === 0) return [];
  return product.variants.map((v) => ({
    variantOptionId: v.variantOptionId,
    price: v.price != null ? String(Number(v.price)) : "",
    sku: v.sku || "",
  }));
}

export default function ProductFormModal({ trigger, categories, product, action, title, variantOptions = [] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attributes, setAttributes] = useState(() =>
    Array.isArray(product?.customAttributes) ? product.customAttributes : []
  );
  const [variantRows, setVariantRows] = useState(() => initialVariantRows(product));
  const [localVariantOptions, setLocalVariantOptions] = useState(variantOptions);
  const [showNewValueForm, setShowNewValueForm] = useState(false);
  const [newValueType, setNewValueType] = useState("WEIGHT");
  const [newValueLabel, setNewValueLabel] = useState("");
  const [newValueError, setNewValueError] = useState("");
  const [savingNewValue, setSavingNewValue] = useState(false);

  async function handleSaveNewValue() {
    if (!newValueLabel.trim()) {
      setNewValueError("Enter a label, e.g. \"250 g\".");
      return;
    }
    setSavingNewValue(true);
    setNewValueError("");
    const fd = new FormData();
    fd.set("type", newValueType);
    fd.set("label", newValueLabel.trim());
    const res = await createVariantOptionAction(fd);
    setSavingNewValue(false);
    if (res?.error) {
      setNewValueError(res.error);
      return;
    }
    setLocalVariantOptions((cur) => [...cur, res.option]);
    // Drop it straight into a fresh variation row so the admin doesn't
    // have to also click "Add Variation" and re-pick it from the list.
    setVariantRows((cur) => [...cur, { variantOptionId: res.option.id, price: "", sku: "" }]);
    setNewValueLabel("");
    setShowNewValueForm(false);
  }

  function addAttribute() {
    setAttributes((cur) => [...cur, { label: "", value: "" }]);
  }
  function removeAttribute(idx) {
    setAttributes((cur) => cur.filter((_, i) => i !== idx));
  }
  function updateAttribute(idx, field, value) {
    setAttributes((cur) => cur.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  }

  function addVariantRow() {
    setVariantRows((cur) => [...cur, { variantOptionId: localVariantOptions[0]?.id ?? "", price: "", sku: "" }]);
  }
  function removeVariantRow(idx) {
    setVariantRows((cur) => cur.filter((_, i) => i !== idx));
  }
  function updateVariantRow(idx, field, value) {
    setVariantRows((cur) => cur.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
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
    setVariantRows(initialVariantRows(product));
    setLocalVariantOptions(variantOptions);
    setShowNewValueForm(false);
    setNewValueLabel("");
    setNewValueError("");
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

          <div className="grid sm:grid-cols-3 gap-4">
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
              <label className="font-body text-xs font-semibold text-charcoal">Price — MRP, incl. GST (₹) <span className="text-fnc-red">*</span></label>
              <input name="price" type="number" step="0.01" defaultValue={product ? Number(product.price) : ""} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Unit <span className="text-fnc-red">*</span></label>
              <input name="unit" defaultValue={product?.unit} placeholder="500 g" required className={inputClasses} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">GST Rate (%)</label>
              <input
                name="gstRate"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.gstRate != null ? Number(product.gstRate) : 0}
                placeholder="0 for fresh/unprocessed items"
                className={inputClasses}
              />
              <p className="font-body text-[11px] text-slate">
                0% for fresh, unprocessed fish/chicken/crab/eggs. Packaged/branded items (snacks, sausages) are
                usually taxed — check your GST rate sheet. This never changes the Price above; it only shows a tax
                breakdown on the invoice.
              </p>
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

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-body text-xs font-semibold text-charcoal">Variations (optional — e.g. 250g / 500g / 1kg, each its own price)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewValueForm((v) => !v)}
                  className="h-8 px-3 rounded-full border border-bordergray font-body text-xs font-semibold text-charcoal hover:border-fnc-red hover:text-fnc-red transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Value
                </button>
                <button
                  type="button"
                  onClick={addVariantRow}
                  disabled={localVariantOptions.length === 0}
                  className="h-8 px-3 rounded-full border border-bordergray font-body text-xs font-semibold text-charcoal hover:border-fnc-red hover:text-fnc-red transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Variation
                </button>
              </div>
            </div>

            {showNewValueForm && (
              <div className="rounded-xl border border-fnc-red/30 bg-fnc-red/5 p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs font-semibold text-charcoal">Add a new value to the master list</p>
                  <button type="button" onClick={() => setShowNewValueForm(false)} aria-label="Close" className="text-slate hover:text-charcoal">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select value={newValueType} onChange={(e) => setNewValueType(e.target.value)} className={`${inputClasses} sm:w-32 shrink-0`}>
                    <option value="WEIGHT">Weight</option>
                    <option value="PIECES">Pieces</option>
                  </select>
                  <input
                    value={newValueLabel}
                    onChange={(e) => setNewValueLabel(e.target.value)}
                    placeholder="e.g. 250 g or 4 pcs"
                    className={`${inputClasses} min-w-0 flex-1`}
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewValue}
                    disabled={savingNewValue}
                    className="h-11 px-4 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shrink-0"
                  >
                    {savingNewValue && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save
                  </button>
                </div>
                {newValueError && <p className="font-body text-xs text-fnc-red">{newValueError}</p>}
                <p className="font-body text-[11px] text-slate">
                  Saved once, reusable on every product from now on — this adds it straight to the list below too.
                </p>
              </div>
            )}

            {localVariantOptions.length === 0 ? (
              <p className="font-body text-xs text-slate italic">
                No variation values yet — click &quot;New Value&quot; above to add one (e.g. &quot;250 g&quot;, &quot;4 pcs&quot;).
              </p>
            ) : (
              <>
                <p className="font-body text-xs text-slate -mt-1">
                  When set, the product page shows these as selectable price options instead of the single Price/Unit
                  above. The first row is shown selected by default.
                </p>
                {variantRows.length === 0 ? (
                  <p className="font-body text-xs text-slate italic">No variations added — this product will show its normal single Price/Unit.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {variantRows.map((row, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <select
                          name="variantOptionId"
                          value={row.variantOptionId}
                          onChange={(e) => updateVariantRow(idx, "variantOptionId", e.target.value)}
                          className={`${inputClasses} min-w-0 sm:flex-1`}
                        >
                          {["WEIGHT", "PIECES"].map((type) => {
                            const opts = localVariantOptions.filter((o) => o.type === type);
                            if (opts.length === 0) return null;
                            return (
                              <optgroup key={type} label={VARIANT_TYPE_LABELS[type]}>
                                {opts.map((o) => (
                                  <option key={o.id} value={o.id}>{o.label}</option>
                                ))}
                              </optgroup>
                            );
                          })}
                        </select>
                        <div className="flex items-center gap-2">
                          <input
                            name="variantPrice"
                            type="number"
                            step="0.01"
                            value={row.price}
                            onChange={(e) => updateVariantRow(idx, "price", e.target.value)}
                            placeholder="Price (₹)"
                            required
                            className={`${inputClasses} w-full sm:w-32 shrink-0`}
                          />
                          <input
                            name="variantSku"
                            value={row.sku}
                            onChange={(e) => updateVariantRow(idx, "sku", e.target.value)}
                            placeholder="SKU (optional)"
                            className={`${inputClasses} w-full sm:w-36 shrink-0`}
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantRow(idx)}
                            aria-label="Remove variation"
                            className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
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
