"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import Modal from "./Modal";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

export default function DeliveryPartnerFormModal({ trigger, partner, action, title, stores = [], scopedStoreId }) {
  const [open, setOpen] = useState(false);
  const [issuedPin, setIssuedPin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.pin) {
        setIssuedPin(result.pin);
      } else {
        setOpen(false);
      }
    } catch (err) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setIssuedPin(null);
    setError("");
    setLoading(false);
  }

  function handleOpen() {
    setError("");
    setLoading(false);
    setIssuedPin(null);
    setOpen(true);
  }

  return (
    <>
      {trigger({ onClick: handleOpen })}
      <Modal open={open} onClose={handleClose} title={title} size="md" description="Manage rider details and status.">
        {issuedPin ? (
          <div className="flex flex-col gap-4 items-center text-center py-4">
            <p className="font-body text-sm text-charcoal">
              Delivery rider saved. Share this PIN with them — it won&apos;t be shown again.
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {error && (
              <div className="p-3 bg-fnc-red/10 border border-fnc-red/20 rounded-xl text-fnc-red text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Name <span className="text-fnc-red">*</span></label>
              <input name="name" defaultValue={partner?.name} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Phone <span className="text-fnc-red">*</span></label>
              <input name="phone" defaultValue={partner?.phone} required disabled={!!partner} className={inputClasses} />
              {partner && <p className="font-body text-xs text-slate">Phone can&apos;t be changed after creation.</p>}
            </div>

            {!scopedStoreId && (
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs font-semibold text-charcoal">Store <span className="text-fnc-red">*</span></label>
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
                <label className="flex items-center gap-2.5 font-body text-sm text-charcoal h-11">
                  <input type="checkbox" name="isActive" defaultChecked={partner?.isActive ?? true} className="h-4 w-4 rounded accent-fnc-red shrink-0" />
                  Active
                </label>
              </div>
            )}

            <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-5 sm:-mb-6 mt-2 bg-white border-t border-bordergray px-4 sm:px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
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
                {partner ? "Save Changes" : "Add Delivery Rider"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
