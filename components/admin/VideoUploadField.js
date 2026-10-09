"use client";

import { useRef, useState } from "react";
import { Video, Loader2, X, ExternalLink } from "lucide-react";

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
    <div className="flex flex-col gap-2">
      {label && <label className="font-body text-xs font-semibold text-charcoal">{label}</label>}
      <input type="hidden" name={name} value={url} />

      {url && !uploading && (
        <div className="relative w-full max-w-sm aspect-video rounded-xl border border-bordergray bg-black overflow-hidden">
          <video src={url} controls preload="metadata" className="h-full w-full object-contain" />
        </div>
      )}

      {!url && !uploading && (
        <div className="w-full max-w-sm aspect-video rounded-xl border border-dashed border-bordergray bg-warmwhite flex items-center justify-center">
          <Video className="h-7 w-7 text-slate" />
        </div>
      )}

      {uploading && (
        <div className="w-full max-w-sm aspect-video rounded-xl border border-bordergray bg-warmwhite flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-fnc-red" />
          <span className="font-body text-xs font-semibold text-charcoal">Uploading... {progress}%</span>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <label className="h-9 px-3.5 rounded-xl border border-bordergray bg-white font-body text-xs font-semibold text-charcoal hover:border-charcoal transition-colors cursor-pointer inline-flex items-center gap-1.5 w-fit">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
          {uploading ? "Uploading..." : url ? "Replace Video" : "Upload Video"}
          <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFileChange} disabled={uploading} className="hidden" />
        </label>
        {url && !uploading && (
          <>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-xl font-body text-xs font-semibold text-charcoal hover:text-fnc-red transition-colors inline-flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open full size
            </a>
            <button
              type="button"
              onClick={() => setUrl("")}
              className="h-9 px-3 rounded-xl font-body text-xs font-semibold text-slate hover:text-fnc-red transition-colors inline-flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </>
        )}
      </div>

      {error && <p className="font-body text-xs text-fnc-red">{error}</p>}
    </div>
  );
}
