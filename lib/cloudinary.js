import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a buffer to Cloudinary under a dedicated "fnc/" folder prefix —
 * this account is currently borrowed from a different project, so keeping
 * every upload under one clearly-scoped folder means migrating to F&C's
 * own Cloudinary account later is a clean cutover, not an untangling job.
 *
 * @param {Buffer} buffer
 * @param {string} folder - e.g. "products", "categories", "banners", "stores"
 * @param {string} publicId - unique id (no extension) for this upload
 * @returns {Promise<string>} the public HTTPS URL of the uploaded image
 */
export async function uploadToCloudinary(buffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `fnc/${folder}`,
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Signs a direct-from-browser upload so large files (video) never pass
 * through our own Node server / Hostinger's proxy at all — only this
 * small signature does. Hostinger's proxy already rejects oversized
 * request bodies with a non-JSON error page (the same issue the product
 * image upload hit before client-side resizing was added); video files
 * are routinely 10-50MB, well past where that becomes a real risk, so
 * the file goes straight to Cloudinary's own API instead.
 */
export function signCloudinaryUpload({ folder, publicId, resourceType = "video" }) {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { folder: `fnc/${folder}`, public_id: publicId, timestamp };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: `fnc/${folder}`,
    publicId,
    resourceType,
  };
}
