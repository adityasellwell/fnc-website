"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";
import ImageUploadField from "./ImageUploadField";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

const textareaClasses =
  "w-full px-3.5 py-2.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors resize-none";

function SubmitButton({ label }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}

export default function CategoryFormModal({ trigger, categories, category, action, title }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <>
      {trigger({ onClick: () => setOpen(true) })}
      <Modal open={open} onClose={() => setOpen(false)} title={title} size="md" description="Manage category details.">
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Name <span className="text-fnc-red">*</span></label>
            <input name="name" defaultValue={category?.name} required className={inputClasses} />
            {category?.slug && (
              <p className="font-body text-[11px] text-slate">
                Page URL: /shop/{category.slug} — set automatically, doesn&apos;t change when you edit the name.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Description</label>
            <textarea name="description" defaultValue={category?.description} rows={2} className={`${textareaClasses} h-20`} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 items-start">
            <ImageUploadField name="image" label="Category Image" defaultValue={category?.image} folder="categories" />
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Sort order</label>
              <input name="order" type="number" defaultValue={category?.order ?? 0} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Parent category</label>
              <select name="parentCategoryId" defaultValue={category?.parentCategoryId ?? ""} className={inputClasses}>
                <option value="">None</option>
                {categories
                  .filter((c) => c.id !== category?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-5 sm:-mb-6 mt-2 bg-white border-t border-bordergray px-4 sm:px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-4 font-body text-sm font-semibold text-charcoal hover:bg-warmwhite rounded-xl transition-colors">
              Cancel
            </button>
            <SubmitButton label={category ? "Save Changes" : "Create Category"} />
          </div>
        </form>
      </Modal>
    </>
  );
}
