"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";
import ImageUploadField from "./ImageUploadField";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

function toDateInputValue(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function SubmitButton({ label }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}

export default function BannerFormModal({ trigger, banner, action, title }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <>
      {trigger({ onClick: () => setOpen(true) })}
      <Modal open={open} onClose={() => setOpen(false)} title={title} size="lg" description="Configure banner placement and content.">
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Placement</label>
              <select name="placement" defaultValue={banner?.placement ?? "HERO"} className={inputClasses}>
                <option value="HERO">Hero (homepage)</option>
                <option value="CATEGORY">Category</option>
                <option value="POPUP">Popup</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Device</label>
              <select name="device" defaultValue={banner?.device ?? "ALL"} className={inputClasses}>
                <option value="ALL">All devices</option>
                <option value="DESKTOP">Desktop only</option>
                <option value="MOBILE">Mobile only</option>
              </select>
            </div>
          </div>

          <ImageUploadField name="image" label="Banner Image" defaultValue={banner?.image} folder="banners" />

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Link (where it goes on click) <span className="text-fnc-red">*</span></label>
            <input name="link" defaultValue={banner?.link} placeholder="/shop/fish" required className={inputClasses} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Title (optional)</label>
            <input name="title" defaultValue={banner?.title ?? ""} className={inputClasses} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Subtitle (optional)</label>
            <input name="subtitle" defaultValue={banner?.subtitle ?? ""} className={inputClasses} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">CTA button label (optional)</label>
            <input name="ctaLabel" defaultValue={banner?.ctaLabel ?? ""} placeholder="Order Now" className={inputClasses} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Priority</label>
              <input name="priority" type="number" defaultValue={banner?.priority ?? 0} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Starts (optional)</label>
              <input name="startsAt" type="date" defaultValue={toDateInputValue(banner?.startsAt)} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Ends (optional)</label>
              <input name="endsAt" type="date" defaultValue={toDateInputValue(banner?.endsAt)} className={inputClasses} />
            </div>
          </div>

          <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-5 sm:-mb-6 mt-2 bg-white border-t border-bordergray px-4 sm:px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-4 font-body text-sm font-semibold text-charcoal hover:bg-warmwhite rounded-xl transition-colors">
              Cancel
            </button>
            <SubmitButton label={banner ? "Save Changes" : "Create Banner"} />
          </div>
        </form>
      </Modal>
    </>
  );
}
