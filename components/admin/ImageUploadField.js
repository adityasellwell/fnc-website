"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

/**
 * Real file upload (Firebase Storage via /api/admin/upload) instead of
 * pasting a raw URL — used anywhere a Product/Category/Banner/Store form
 * needs an image. Renders a hidden input so the surrounding native
 * <form action={serverAction}> still picks up the resulting URL under
 * `name`, exactly like the plain text input it replaces.
 */
export default function ImageUploadField({ name, label, defaultValue, folder = "misc" }) {
  const [url, setUrl] = useState(defaultValue || "");
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
      setUrl(json.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="font-body text-xs font-semibold text-charcoal">{label}</label>}
      <input type="hidden" name={name} value={url} />

      <div className="flex items-center gap-4">
        <div className="relative h-28 w-28 shrink-0 rounded-xl border border-bordergray bg-warmwhite overflow-hidden flex items-center justify-center">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs, not a static/known asset next/image can optimize
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-7 w-7 text-slate" />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="h-9 px-3.5 rounded-xl border border-bordergray bg-white font-body text-xs font-semibold text-charcoal hover:border-charcoal transition-colors cursor-pointer inline-flex items-center gap-1.5 w-fit">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            {uploading ? "Uploading..." : url ? "Change Image" : "Upload Image"}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} disabled={uploading} className="hidden" />
          </label>
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="h-7 px-2 rounded-lg font-body text-[11px] font-semibold text-slate hover:text-fnc-red transition-colors inline-flex items-center gap-1 w-fit"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <p className="font-body text-xs text-fnc-red">{error}</p>}
    </div>
  );
}
