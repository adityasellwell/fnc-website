import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { signCloudinaryUpload } from "@/lib/cloudinary";

/**
 * Issues a short-lived signature so the browser can upload large files
 * (video) directly to Cloudinary, instead of routing the file bytes
 * through our own server — see signCloudinaryUpload for why.
 */
export async function POST(request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Sign in as an admin to upload." }, { status: 401 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary credentials are missing from server environment variables." }, { status: 500 });
  }

  const { folder, resourceType } = await request.json();
  const safeFolder = (folder || "misc").toString().replace(/[^a-z0-9-]/gi, "");
  const publicId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const data = signCloudinaryUpload({ folder: safeFolder, publicId, resourceType: resourceType === "video" ? "video" : "image" });
  return NextResponse.json(data);
}
