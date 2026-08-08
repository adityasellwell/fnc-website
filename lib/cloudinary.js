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
