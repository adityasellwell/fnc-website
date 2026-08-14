"use client";

import { useState } from "react";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import Modal from "./Modal";
import { inviteTeamMemberAction } from "@/app/admin/team/actions";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

export default function InviteTeamMemberModal({ roles, currentUser, stores = [] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const res = await inviteTeamMemberAction(formData);
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
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="h-10 px-4 rounded-full bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors flex items-center gap-1.5"
      >
        <UserPlus className="h-4 w-4" />
        Invite Team Member
      </button>
      <Modal open={open} onClose={() => !loading && setOpen(false)} title="Invite Team Member">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {error && (
            <div className="p-3 bg-fnc-red/10 border border-fnc-red/20 rounded-xl text-fnc-red text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <p className="font-body text-sm text-slate">
            This creates a pending account. Tell them to sign up on the site with this exact
            email — they will automatically get this role the moment they sign in.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Name <span className="text-fnc-red">*</span></label>
            <input name="name" required className={inputClasses} placeholder="Their full name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Email <span className="text-fnc-red">*</span></label>
            <input name="email" type="email" required className={inputClasses} placeholder="them@example.com" />
          </div>
          {currentUser?.role?.name === "admin" && (
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Store</label>
              <select name="storeId" className={inputClasses}>
                <option value="">Head Office / All Stores</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold text-charcoal">Role <span className="text-fnc-red">*</span></label>
            <select name="roleId" required className={inputClasses}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
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
              Send Invite
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
