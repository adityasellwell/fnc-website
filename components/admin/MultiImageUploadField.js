"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

/**
 * Same upload-by-file flow as ImageUploadField, but for a list of images
 * (the product gallery) instead of one. Outputs a single hidden input with
 * a comma-separated URL list under `name`, matching the format
 * app/admin/products/actions.js's parseProductForm() already expects for
 * `additionalImages` — no server-action changes needed.
 */
export default function MultiImageUploadField({ name, label, defaultValue = [], folder = "misc" }) {
  const [urls, setUrls] = useState(defaultValue.filter(Boolean));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Upload failed");
      setUrls((prev) => [...prev, json.url]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(idx) {
    setUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="font-body text-xs font-semibold text-charcoal">{label}</label>}
      <input type="hidden" name={name} value={urls.join(",")} />

      <div className="flex flex-wrap gap-2.5">
        {urls.map((url, idx) => (
          <div key={idx} className="relative h-16 w-16 shrink-0 rounded-xl border border-bordergray bg-warmwhite overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              aria-label="Remove image"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}

        <label className="h-16 w-16 shrink-0 rounded-xl border border-dashed border-bordergray bg-white hover:border-charcoal transition-colors cursor-pointer flex items-center justify-center">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate" />
          ) : (
            <ImagePlus className="h-4 w-4 text-slate" />
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} disabled={uploading} className="hidden" />
        </label>
      </div>

      {error && <p className="font-body text-xs text-fnc-red">{error}</p>}
    </div>
  );
}
