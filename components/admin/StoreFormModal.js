"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Modal from "./Modal";
import ImageUploadField from "./ImageUploadField";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

const DAYS = [
  ["mon", "Monday"],
  ["tue", "Tuesday"],
  ["wed", "Wednesday"],
  ["thu", "Thursday"],
  ["fri", "Friday"],
  ["sat", "Saturday"],
  ["sun", "Sunday"],
];

function SubmitButton({ label }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}

/** Seeds the editable link list from deliveryPartnerLinks, falling back to the legacy fixed Swiggy/Zomato fields for stores that only have those set. */
function initialLinks(store) {
  if (Array.isArray(store?.deliveryPartnerLinks) && store.deliveryPartnerLinks.length > 0) {
    return store.deliveryPartnerLinks;
  }
  const legacy = [];
  if (store?.swiggyUrl) legacy.push({ label: "Swiggy", url: store.swiggyUrl });
  if (store?.zomatoUrl) legacy.push({ label: "Zomato", url: store.zomatoUrl });
  return legacy;
}

export default function StoreFormModal({ trigger, store, action, title }) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState(() => initialLinks(store));

  function addLink() {
    setLinks((cur) => [...cur, { label: "", url: "" }]);
  }
  function removeLink(idx) {
    setLinks((cur) => cur.filter((_, i) => i !== idx));
  }
  function updateLink(idx, field, value) {
    setLinks((cur) => cur.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  }

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
              <input name="name" defaultValue={store?.name} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Slug</label>
              <input name="slug" defaultValue={store?.slug} required className={inputClasses} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Address</label>
            <input name="address" defaultValue={store?.address} required className={inputClasses} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">City</label>
              <input name="city" defaultValue={store?.city} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">State</label>
              <input name="state" defaultValue={store?.state} required className={inputClasses} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Latitude</label>
              <input name="latitude" type="number" step="any" defaultValue={store?.latitude} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Longitude</label>
              <input name="longitude" type="number" step="any" defaultValue={store?.longitude} required className={inputClasses} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Phone</label>
              <input name="phone" defaultValue={store?.phone} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">WhatsApp</label>
              <input name="whatsapp" defaultValue={store?.whatsapp} required className={inputClasses} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Google Maps Link</label>
            <input name="googleMapsLink" defaultValue={store?.googleMapsLink} className={inputClasses} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-body text-xs font-semibold text-charcoal">Delivery Partner Links (optional)</label>
              <button
                type="button"
                onClick={addLink}
                className="h-8 px-3 rounded-full border border-bordergray font-body text-xs font-semibold text-charcoal hover:border-fnc-red hover:text-fnc-red transition-colors flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Link
              </button>
            </div>
            <p className="font-body text-xs text-slate -mt-1">
              Add as many ordering platforms as you want — Swiggy, Zomato, Dunzo, ONDC, anything with a store listing URL. These show up as options in the site&apos;s delivery-partner selector.
            </p>
            {links.length === 0 ? (
              <p className="font-body text-xs text-slate italic">No platform links added — customers will only see F&C&apos;s own delivery/pickup.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {links.map((link, idx) => (
                  <div key={idx} className="rounded-xl border border-bordergray p-3 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        name="link_label"
                        value={link.label}
                        onChange={(e) => updateLink(idx, "label", e.target.value)}
                        placeholder="Platform name (e.g. Swiggy)"
                        className={`${inputClasses} min-w-0 flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(idx)}
                        aria-label="Remove link"
                        className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-body text-[11px] font-semibold text-slate uppercase tracking-wide">Listing URL</label>
                      <input
                        name="link_url"
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(idx, "url", e.target.value)}
                        placeholder="https://www.swiggy.com/restaurants/..."
                        className={`${inputClasses} min-w-0`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ImageUploadField name="image" label="Store Image" defaultValue={store?.images?.[0]} folder="stores" />

          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Status</label>
              <select name="status" defaultValue={store?.status ?? "COMING_SOON"} className={inputClasses}>
                <option value="ACTIVE">Active</option>
                <option value="COMING_SOON">Coming Soon</option>
              </select>
            </div>
            <label className="flex items-center justify-between gap-2.5 font-body text-sm text-charcoal h-11 px-3.5 rounded-xl border border-bordergray">
              Delivery available
              <input type="checkbox" name="deliveryAvailable" defaultChecked={store?.deliveryAvailable ?? false} className="h-4 w-4 rounded accent-fnc-red shrink-0" />
            </label>
            <label className="flex items-center justify-between gap-2.5 font-body text-sm text-charcoal h-11 px-3.5 rounded-xl border border-bordergray">
              Pickup available
              <input type="checkbox" name="pickupAvailable" defaultChecked={store?.pickupAvailable ?? true} className="h-4 w-4 rounded accent-fnc-red shrink-0" />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-body text-xs font-semibold text-charcoal">Opening Hours</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {DAYS.map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-body text-xs text-slate w-20 shrink-0">{label}</span>
                  <input
                    name={`hours_${key}`}
                    defaultValue={store?.openingHours?.[key] ?? ""}
                    placeholder="7:00 AM - 9:00 PM"
                    className={`${inputClasses} h-10`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-4 font-body text-sm font-semibold text-charcoal hover:bg-warmwhite rounded-xl transition-colors">
              Cancel
            </button>
            <SubmitButton label={store ? "Save Changes" : "Create Store"} />
          </div>
        </form>
      </Modal>
    </>
  );
}
