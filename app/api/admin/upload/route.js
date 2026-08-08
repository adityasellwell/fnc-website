import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Admin-only image upload — used by the admin panel's Products/Categories/
 * Banners/Store forms instead of pasting a raw URL. Uploads to Cloudinary
 * (authorization enforced here, the same way every other admin action in
 * this app is gated) and returns a public URL that gets saved into the
 * same image field every product/category/banner/store already uses —
 * no schema changes needed.
 */
export async function POST(request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Sign in as an admin to upload images." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder")?.toString().replace(/[^a-z0-9-]/gi, "") || "misc";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WEBP or GIF images are allowed." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const url = await uploadToCloudinary(buffer, folder, publicId);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[POST /api/admin/upload] failed:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
