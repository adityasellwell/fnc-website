"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
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

export default function StoreFormModal({ trigger, store, action, title }) {
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

          <ImageUploadField name="image" label="Store Image" defaultValue={store?.images?.[0]} folder="stores" />

          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Status</label>
              <select name="status" defaultValue={store?.status ?? "COMING_SOON"} className={inputClasses}>
                <option value="ACTIVE">Active</option>
                <option value="COMING_SOON">Coming Soon</option>
              </select>
            </div>
            <label className="flex items-center gap-2 font-body text-sm text-charcoal h-11">
              <input type="checkbox" name="deliveryAvailable" defaultChecked={store?.deliveryAvailable ?? false} className="h-4 w-4 rounded accent-fnc-red" />
              Delivery available
            </label>
            <label className="flex items-center gap-2 font-body text-sm text-charcoal h-11">
              <input type="checkbox" name="pickupAvailable" defaultChecked={store?.pickupAvailable ?? true} className="h-4 w-4 rounded accent-fnc-red" />
              Pickup available
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
