"use client";

import { useState } from "react";
import { User, Edit3, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { updateProfileAction } from "@/app/account/actions";
import { useAuth } from "@/components/auth/AuthProvider";

const inputClasses =
  "w-full h-11 px-4 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

export default function ProfileForm({ customer }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const [formValues, setFormValues] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
  });

  if (!customer) return null;

  const handleChange = (field) => (e) => {
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData();
    formData.append("name", formValues.name);
    formData.append("email", formValues.email);
    formData.append("phone", formValues.phone);

    const res = await updateProfileAction(null, formData);

    if (res.ok) {
      setIsEditing(false);
    } else {
      setError(res.error || "Failed to update profile");
    }
    setPending(false);
  }

  return (
    <div className="bg-white border border-bordergray rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-lg font-bold text-charcoal flex items-center gap-2">
          <User className="h-5 w-5 text-fnc-red" />
          Profile Details
        </h2>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-fnc-red hover:underline"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      {(() => {
        const initials = customer.name
          ? customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "U";
        return (
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dashed border-bordergray/60">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={customer.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-fnc-red/20 shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-fnc-red text-white flex items-center justify-center font-display text-xl font-extrabold shadow-sm border border-fnc-red/20">
                {initials}
              </div>
            )}
            <div>
              <h3 className="font-display text-base font-bold text-charcoal">{customer.name}</h3>
              <p className="font-body text-xs text-slate mt-0.5">Verified Account</p>
            </div>
          </div>
        );
      })()}

      {error && (
        <div className="bg-fnc-red/10 border border-fnc-red/20 rounded-xl p-3 mb-4 text-xs font-body text-fnc-red">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-name" className="font-body text-xs font-semibold text-slate uppercase tracking-wide">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              required
              className={inputClasses}
              value={formValues.name}
              onChange={handleChange("name")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="profile-email" className="font-body text-xs font-semibold text-slate uppercase tracking-wide">
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              className={inputClasses}
              placeholder="e.g. yourname@example.com"
              value={formValues.email}
              onChange={handleChange("email")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="profile-phone" className="font-body text-xs font-semibold text-slate uppercase tracking-wide">
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              className={inputClasses}
              placeholder="e.g. +91 98765 43210"
              value={formValues.phone}
              onChange={handleChange("phone")}
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Button
              type="submit"
              size="sm"
              disabled={pending}
              className="px-5 font-bold"
            >
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setFormValues({
                  name: customer?.name || "",
                  email: customer?.email || "",
                  phone: customer?.phone || "",
                });
                setIsEditing(false);
                setError("");
              }}
              className="h-9 px-4 text-xs font-semibold text-slate border border-bordergray rounded-full hover:border-charcoal transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4 font-body text-sm">
          <div className="flex justify-between py-2 border-b border-dashed border-bordergray/60">
            <span className="text-slate font-medium">Name</span>
            <span className="text-charcoal font-semibold">{customer.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-dashed border-bordergray/60">
            <span className="text-slate font-medium">Email</span>
            <span className="text-charcoal font-semibold">{customer.email || "—"}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate font-medium">Phone</span>
            <span className="text-charcoal font-semibold">{customer.phone || "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
