import { auth } from "@/lib/auth";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

/**
 * POST /api/admin/upload-signature
 *
 * Generates a Cloudinary signed upload signature server-side.
 * Protected — only authenticated admins can call this.
 *
 * Flow:
 *  1. Browser requests a signature + timestamp from this route (requires admin session)
 *  2. This route signs the params with CLOUDINARY_API_SECRET (never leaves the server)
 *  3. Browser uploads directly to Cloudinary using: api_key + timestamp + signature
 *  4. Cloudinary validates the signature — rejects anything not signed by us
 */
export async function POST() {
  // ── Auth guard ─────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    ? "VEYROVA/products"
    : "products";

  if (!apiSecret || !apiKey) {
    return NextResponse.json(
      { error: "Cloudinary not configured on server" },
      { status: 500 }
    );
  }

  // ── Build signature ─────────────────────────────────────────────────────
  // Cloudinary signature algorithm:
  //   SHA1( "folder=X&timestamp=N&upload_preset=Y" + apiSecret )
  const timestamp = Math.round(Date.now() / 1000);
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "VEYROVA";

  // Params MUST be sorted alphabetically
  const paramsToSign = [
    `folder=${folder}`,
    `timestamp=${timestamp}`,
    `upload_preset=${uploadPreset}`,
  ]
    .sort()
    .join("&");

  const signature = createHash("sha256")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    folder,
    uploadPreset,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}
