"use client";

import { useState, useTransition } from "react";
import { toggleProductActiveAction } from "@/app/admin/products/actions";
import { cn } from "@/lib/utils";

// Admin-only visibility switch, shown on the products list — flipping it
// off hides the product from the storefront entirely (see the isActive
// filter in lib/data/products.js) without touching any other field.
export default function ActiveToggle({ productId, isActive }) {
  const [value, setValue] = useState(isActive);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !value;
    setValue(next);
    startTransition(async () => {
      const result = await toggleProductActiveAction(productId, next);
      if (result?.error) {
        setValue(!next); // revert on failure
        alert(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={toggle}
      disabled={pending}
      className="flex items-center gap-2 disabled:opacity-60"
    >
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          value ? "bg-fnc-green" : "bg-bordergray"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform",
            value ? "translate-x-4.5" : "translate-x-0.5"
          )}
        />
      </span>
      <span className={cn("font-body text-xs font-semibold", value ? "text-fnc-green" : "text-slate")}>
        {value ? "Active" : "Inactive"}
      </span>
    </button>
  );
}
