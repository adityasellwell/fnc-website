"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import Modal from "./Modal";

/**
 * Trigger-render-prop pattern: `trigger` gets an `onClick` to open the
 * dialog. `onConfirm` may be async (e.g. a Server Action) — shows a
 * pending state and closes automatically on success.
 */
export default function ConfirmDialog({
  trigger,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  danger = true,
  onConfirm,
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {trigger({ onClick: () => setOpen(true) })}
      <Modal open={open} onClose={() => !pending && setOpen(false)} title={title} size="sm">
        <div className="flex flex-col gap-4">
          {description && (
            <p className="font-body text-sm text-slate flex items-start gap-2">
              {danger && <AlertTriangle className="h-4 w-4 text-fnc-red shrink-0 mt-0.5" />}
              {description}
            </p>
          )}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="h-10 px-4 rounded-xl font-body text-sm font-semibold text-charcoal hover:bg-warmwhite transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className={`h-10 px-4 rounded-xl font-body text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center gap-2 ${
                danger ? "bg-fnc-red hover:bg-fnc-red/90" : "bg-charcoal hover:bg-charcoal/90"
              }`}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
