"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

function SubmitButton({ label }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}

export default function DeliveryPartnerFormModal({ trigger, partner, action, title, stores = [], scopedStoreId }) {
  const [open, setOpen] = useState(false);
  const [issuedPin, setIssuedPin] = useState(null);

  async function handleSubmit(formData) {
    const result = await action(formData);
    if (result?.pin) {
      setIssuedPin(result.pin);
    } else {
      setOpen(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setIssuedPin(null);
  }

  return (
    <>
      {trigger({ onClick: () => setOpen(true) })}
      <Modal open={open} onClose={handleClose} title={title} maxWidth="max-w-lg">
        {issuedPin ? (
          <div className="flex flex-col gap-4 items-center text-center py-4">
            <p className="font-body text-sm text-charcoal">
              Delivery partner saved. Share this PIN with them — it won&apos;t be shown again.
            </p>
            <p className="font-display text-4xl font-bold tracking-widest text-fnc-red">{issuedPin}</p>
            <p className="font-body text-xs text-slate">
              They can sign in at <span className="font-semibold">/delivery-partner/sign-in</span> using their phone number and this PIN.
            </p>
            <button type="button" onClick={handleClose} className="h-11 px-5 rounded-xl bg-charcoal text-white font-body text-sm font-semibold hover:bg-charcoal/90 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Name</label>
              <input name="name" defaultValue={partner?.name} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Phone</label>
              <input name="phone" defaultValue={partner?.phone} required disabled={!!partner} className={inputClasses} />
              {partner && <p className="font-body text-xs text-slate">Phone can&apos;t be changed after creation.</p>}
            </div>

            {!scopedStoreId && (
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs font-semibold text-charcoal">Store</label>
                <select name="storeId" defaultValue={partner?.storeId} required={!partner} disabled={!!partner} className={inputClasses}>
                  <option value="">Select a store...</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs font-semibold text-charcoal">Vehicle Type</label>
                <input name="vehicleType" defaultValue={partner?.vehicleType ?? ""} placeholder="Bike, Scooter..." className={inputClasses} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs font-semibold text-charcoal">Vehicle Number</label>
                <input name="vehicleNumber" defaultValue={partner?.vehicleNumber ?? ""} placeholder="MH-04-..." className={inputClasses} />
              </div>
            </div>

            {partner && (
              <div className="grid sm:grid-cols-2 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-semibold text-charcoal">Status</label>
                  <select name="status" defaultValue={partner?.status ?? "OFFLINE"} className={inputClasses}>
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 font-body text-sm text-charcoal h-11">
                  <input type="checkbox" name="isActive" defaultChecked={partner?.isActive ?? true} className="h-4 w-4 rounded accent-fnc-red" />
                  Active
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={handleClose} className="h-11 px-4 font-body text-sm font-semibold text-charcoal hover:bg-warmwhite rounded-xl transition-colors">
                Cancel
              </button>
              <SubmitButton label={partner ? "Save Changes" : "Add Partner"} />
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
