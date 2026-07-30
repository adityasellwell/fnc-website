"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Generic filter bar — updates URL query params on change (page resets to
 * 1 whenever a filter changes, since the result set shifts under it).
 * `fields`: [{ key, label, type: "search" | "select", options?: [{value,label}] }]
 */
export default function Filters({ fields }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      {fields.map((field) => {
        if (field.type === "select") {
          return (
            <select
              key={field.key}
              value={searchParams.get(field.key) ?? ""}
              onChange={(e) => updateParam(field.key, e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none transition-colors"
            >
              <option value="">{field.label}: All</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }
        return (
          <div key={field.key} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
            <input
              type="text"
              defaultValue={searchParams.get(field.key) ?? ""}
              placeholder={field.label}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateParam(field.key, e.currentTarget.value);
              }}
              onBlur={(e) => updateParam(field.key, e.currentTarget.value)}
              className="h-10 pl-9 pr-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors"
            />
          </div>
        );
      })}
    </div>
  );
}
