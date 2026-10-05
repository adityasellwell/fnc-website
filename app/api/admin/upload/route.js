import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { recordApiLog } from "@/lib/logger";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB — client already downscales before upload
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request) {
  const startTime = Date.now();
  const route = "/api/admin/upload";
  const userAgent = request.headers.get("user-agent") || "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  const admin = await getAdminUser();
  if (!admin) {
    recordApiLog({ route, method: "POST", statusCode: 401, durationMs: Date.now() - startTime, ip, userAgent, error: "Unauthorized upload attempt" });
    return NextResponse.json({ error: "Sign in as an admin to upload images." }, { status: 401 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    recordApiLog({ route, method: "POST", statusCode: 500, durationMs: Date.now() - startTime, ip, userAgent, error: "Cloudinary credentials missing" });
    return NextResponse.json(
      { error: "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing from server environment variables." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder")?.toString().replace(/[^a-z0-9-]/gi, "") || "misc";

  if (!file || typeof file === "string") {
    recordApiLog({ route, method: "POST", statusCode: 400, durationMs: Date.now() - startTime, ip, userAgent, error: "No file provided" });
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    recordApiLog({ route, method: "POST", statusCode: 400, durationMs: Date.now() - startTime, ip, userAgent, error: `Invalid image type ${file.type}` });
    return NextResponse.json({ error: "Only JPG, PNG, WEBP or GIF images are allowed." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    recordApiLog({ route, method: "POST", statusCode: 400, durationMs: Date.now() - startTime, ip, userAgent, error: `File size ${file.size} exceeds 8MB` });
    return NextResponse.json({ error: "Image must be under 8MB." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const url = await uploadToCloudinary(buffer, folder, publicId);

    recordApiLog({ route, method: "POST", statusCode: 200, durationMs: Date.now() - startTime, ip, userAgent, details: { folder, size: file.size, url } });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[POST /api/admin/upload] failed:", err);
    recordApiLog({ route, method: "POST", statusCode: 500, durationMs: Date.now() - startTime, ip, userAgent, error: err?.message || String(err) });
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
