"use client";

import { updateAdminProfileAction } from "./actions";
import { useState } from "react";
import { Loader2, UserCircle } from "lucide-react";

export default function AdminProfileClient({ initialName, email, role, storeName }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const formData = new FormData(e.target);
    try {
      await updateAdminProfileAction(formData);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-bordergray rounded-3xl p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
        <UserCircle className="h-5 w-5 text-fnc-red" />
        Profile Settings
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {message && (
          <div className="bg-fnc-green/10 text-fnc-green text-xs font-semibold px-3 py-2 rounded-xl">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-fnc-red/10 text-fnc-red text-xs font-semibold px-3 py-2 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Email Address</span>
          <span className="font-body text-sm text-charcoal bg-warmwhite/50 px-3 py-2 rounded-xl border border-bordergray/40 select-none">
            {email}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Role</span>
            <span className="font-body text-xs font-semibold text-fnc-red bg-fnc-red/5 px-2.5 py-1.5 rounded-full text-center capitalize w-fit">
              {role === "admin" ? "Super Admin" : role.replace("_", " ")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Store Scoping</span>
            <span className="font-body text-xs font-semibold text-charcoal bg-warmwhite/50 px-2.5 py-1.5 rounded-full text-center truncate capitalize w-fit">
              {storeName || "Global (All Stores)"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-name" className="text-[10px] font-bold text-slate uppercase tracking-wider">
            Full Name
          </label>
          <input
            id="admin-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="h-10 px-4 rounded-xl bg-fnc-red text-white font-body text-xs font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 mt-2 shadow-sm"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
