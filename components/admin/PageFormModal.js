"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

const textareaClasses =
  "w-full px-3.5 py-2.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors resize-none";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Save Page
    </button>
  );
}

export default function PageFormModal({ trigger, page, action, title, knownSlugs = [] }) {
  const [open, setOpen] = useState(false);
  const isKnownSlug = page && knownSlugs.includes(page.slug);

  async function handleSubmit(formData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <>
      {trigger({ onClick: () => setOpen(true) })}
      <Modal open={open} onClose={() => setOpen(false)} title={title} size="xl" description="Edit page content.">
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Title <span className="text-fnc-red">*</span></label>
              <input name="title" defaultValue={page?.title} required className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">
                Slug {isKnownSlug && <span className="text-slate font-normal">(fixed — used by the live page)</span>}
              </label>
              <input name="slug" defaultValue={page?.slug} required readOnly={isKnownSlug} className={`${inputClasses} ${isKnownSlug ? "bg-warmwhite text-slate" : ""}`} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Content</label>
            <p className="font-body text-[11px] text-slate">
              Start a line with &quot;## &quot; for a heading, &quot;- &quot; for a bullet point, blank lines separate sections.
            </p>
            <textarea
              name="content"
              defaultValue={page?.content}
              rows={16}
              required
              className={`${textareaClasses} h-80 py-3 font-mono text-xs leading-relaxed resize-y`}
            />
          </div>

          <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-5 sm:-mb-6 mt-2 bg-white border-t border-bordergray px-4 sm:px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className="h-11 px-4 font-body text-sm font-semibold text-charcoal hover:bg-warmwhite rounded-xl transition-colors">
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </>
  );
}
