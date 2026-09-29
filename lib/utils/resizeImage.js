"use client";

// Raw camera/phone photos (10-20MB) were failing to upload entirely —
// Hostinger's proxy in front of the app rejects oversized request bodies
// with a plain HTML error page, and the client tried to parse that as
// JSON, surfacing as a confusing "failed to execute json" crash instead
// of a real error. Downscaling before upload fixes both: the request
// stays well under any size limit, and uploads are much faster. 2400px is
// larger than this site ever displays a product photo at, so there's no
// visible quality loss.
const MAX_DIMENSION = 2400;
const JPEG_QUALITY = 0.92;
const SKIP_RESIZE_UNDER_BYTES = 1.5 * 1024 * 1024; // already-small files pass through untouched

export async function resizeImageForUpload(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file; // don't touch animated GIFs
  if (file.size <= SKIP_RESIZE_UNDER_BYTES) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file; // decode failed — fall back to the original rather than blocking the upload

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
