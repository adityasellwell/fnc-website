"use client";

import { useRef, useState } from "react";
import { Video, Loader2, X } from "lucide-react";

/**
 * Uploads directly from the browser to Cloudinary (see
 * lib/cloudinary.js#signCloudinaryUpload) rather than through our own
 * /api/admin/upload — video files are routinely 10-50MB, well past what
 * Hostinger's proxy reliably passes through in one request body.
 */
export default function VideoUploadField({ name, label, defaultValue, folder = "misc" }) {
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const sigRes = await fetch("/api/admin/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, resourceType: "video" }),
      });
      const sig = await sigRes.json();
      if (!sigRes.ok) throw new Error(sig.error || "Could not get an upload signature.");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", sig.timestamp);
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);
      formData.append("public_id", sig.publicId);

      const uploadedUrl = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`);
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) setProgress(Math.round((evt.loaded / evt.total) * 100));
        };
        xhr.onload = () => {
          try {
            const body = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve(body.secure_url);
            else reject(new Error(body.error?.message || "Upload failed."));
          } catch {
            reject(new Error("Upload failed (unexpected response)."));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed — check your connection and try again."));
        xhr.send(formData);
      });

      setUrl(uploadedUrl);
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
        <div className="relative h-20 w-32 shrink-0 rounded-xl border border-bordergray bg-warmwhite overflow-hidden flex items-center justify-center">
          {url ? (
            <video src={url} className="h-full w-full object-cover" muted />
          ) : (
            <Video className="h-7 w-7 text-slate" />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="h-9 px-3.5 rounded-xl border border-bordergray bg-white font-body text-xs font-semibold text-charcoal hover:border-charcoal transition-colors cursor-pointer inline-flex items-center gap-1.5 w-fit">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
            {uploading ? `Uploading... ${progress}%` : url ? "Replace Video" : "Upload Video"}
            <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFileChange} disabled={uploading} className="hidden" />
          </label>
          {url && !uploading && (
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
