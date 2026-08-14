"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, XCircle } from "lucide-react";
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
  const [error, setError] = useState("");

  async function handleConfirm() {
    setPending(true);
    setError("");
    try {
      // Next.js redacts a thrown Error's message from a Server Action in
      // production (a generic "An error occurred..." replaces it) — so a
      // meaningful failure reason has to come back as a normal return
      // value, not a throw. Actions that can fail for a real, expected
      // reason (e.g. "this product has order history") return
      // { error: "..." } instead of throwing; this checks for that first
      // and only falls through to catch for genuinely unexpected errors.
      const result = await onConfirm();
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
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
          {error && (
            <p className="font-body text-sm text-fnc-red flex items-start gap-2 bg-fnc-red/5 border border-fnc-red/20 rounded-xl px-3 py-2.5">
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
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
