"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import Modal from "./Modal";
import ImageUploadField from "./ImageUploadField";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

function toDateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default function CouponFormModal({ trigger, coupon, action, title, categories = [], products = [] }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(coupon?.type ?? "COUPON");
  const [appliesTo, setAppliesTo] = useState(coupon?.appliesTo ?? "CART");
  const [selectedProductIds, setSelectedProductIds] = useState(
    () => new Set((coupon?.scopeProducts ?? []).map((p) => p.id))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleProduct(id) {
    setSelectedProductIds((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
    setType(coupon?.type ?? "COUPON");
    setAppliesTo(coupon?.appliesTo ?? "CART");
    setSelectedProductIds(new Set((coupon?.scopeProducts ?? []).map((p) => p.id)));
    setOpen(true);
  }

  return (
    <>
      {trigger({ onClick: handleOpen })}
      <Modal open={open} onClose={() => !loading && setOpen(false)} title={title} size="md" description="Configure discount rules and validity.">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {error && (
            <div className="p-3 bg-fnc-red/10 border border-fnc-red/20 rounded-xl text-fnc-red text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Promotion type</label>
              <select name="type" value={type} onChange={(e) => setType(e.target.value)} className={inputClasses}>
                <option value="COUPON">Coupon (customer types a code)</option>
                <option value="OFFER">Offer (auto-applied campaign)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">
                Code{type === "OFFER" ? " (optional)" : ""}
              </label>
              <input name="code" defaultValue={coupon?.code ?? ""} placeholder="WELCOME10" required={type === "COUPON"} className={`${inputClasses} uppercase`} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Title <span className="text-fnc-red">*</span></label>
            <input name="title" defaultValue={coupon?.title} placeholder="Welcome offer" required className={inputClasses} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Description (optional)</label>
            <input name="description" defaultValue={coupon?.description ?? ""} placeholder="10% off your first order" className={inputClasses} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Discount type</label>
              <select name="discountType" defaultValue={coupon?.discountType ?? "PERCENT"} className={inputClasses}>
                <option value="PERCENT">Percent off</option>
                <option value="FLAT">Flat amount off</option>
                <option value="BOGO">Buy One Get One</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Value <span className="text-fnc-red">*</span></label>
              <input name="value" type="number" step="0.01" defaultValue={coupon ? Number(coupon.value) : ""} required className={inputClasses} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Min. order value (optional)</label>
              <input name="minOrderValue" type="number" step="0.01" defaultValue={coupon?.minOrderValue ? Number(coupon.minOrderValue) : ""} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Usage limit (optional)</label>
              <input name="usageLimit" type="number" defaultValue={coupon?.usageLimit ?? ""} className={inputClasses} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Applies to</label>
            <select name="appliesTo" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} className={inputClasses}>
              <option value="CART">Whole cart</option>
              <option value="PRODUCT">Specific products</option>
              <option value="CATEGORY">Specific category</option>
            </select>
          </div>

          {appliesTo === "PRODUCT" && (
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">
                Select product(s) <span className="text-fnc-red">*</span>
              </label>
              <div className="max-h-48 overflow-y-auto border border-bordergray rounded-xl p-2 flex flex-col gap-1">
                {products.length === 0 && (
                  <p className="font-body text-xs text-slate p-2">No products found.</p>
                )}
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2.5 font-body text-sm text-charcoal px-2 py-1.5 rounded-lg hover:bg-warmwhite cursor-pointer">
                    <input
                      type="checkbox"
                      name="productIds"
                      value={p.id}
                      checked={selectedProductIds.has(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="h-4 w-4 rounded accent-fnc-red shrink-0"
                    />
                    {p.name}
                  </label>
                ))}
              </div>
              <p className="font-body text-xs text-slate">{selectedProductIds.size} selected</p>
            </div>
          )}

          {appliesTo === "CATEGORY" && (
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">
                Select category <span className="text-fnc-red">*</span>
              </label>
              <select name="scopeCategoryId" defaultValue={coupon?.scopeCategoryId ?? ""} required className={inputClasses}>
                <option value="" disabled>Choose a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <ImageUploadField name="bannerImage" label="Banner Image (optional)" defaultValue={coupon?.bannerImage ?? ""} folder="banners" />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Starts (optional)</label>
              <input name="startsAt" type="date" defaultValue={toDateInputValue(coupon?.startsAt)} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Ends (optional)</label>
              <input name="endsAt" type="date" defaultValue={toDateInputValue(coupon?.endsAt)} className={inputClasses} />
            </div>
          </div>

          <label className="flex items-center gap-2.5 font-body text-sm text-charcoal h-11">
            <input type="checkbox" name="active" defaultChecked={coupon?.active ?? true} className="h-4 w-4 rounded accent-fnc-red shrink-0" />
            Active
          </label>

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
              {coupon ? "Save Changes" : "Create Promotion"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
