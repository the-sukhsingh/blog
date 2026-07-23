import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { STORAGE_BUCKET, supabaseAdmin } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse form data ───────────────────────────────────────────────────────
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: `File type "${file.type}" is not allowed. Use JPEG, PNG, WebP, GIF, AVIF, or SVG.`,
      },
      { status: 415 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`,
      },
      { status: 413 },
    );
  }

  // ── Build a clean filename ────────────────────────────────────────────────
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safeName = file.name
    .replace(/\.[^.]+$/, "") // strip extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // slug-safe chars
    .slice(0, 60);
  const filename = `${Date.now()}-${safeName}.${ext}`;

  // ── Upload to Supabase Storage ────────────────────────────────────────────
  if (supabaseAdmin) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: "31536000", // 1 year
        upsert: false,
      });

    if (error) {
      console.error("[upload] Supabase Storage error:", error.message);
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 },
      );
    }

    // Return a relative URL by default (/storage/v1/object/public/...)
    // so images work seamlessly regardless of host port (-p 80:3000, -p 8080:3000, etc.) or domain.
    const customPublicUrl = process.env.SUPABASE_STORAGE_PUBLIC_URL;
    const isLocalDefault =
      !customPublicUrl ||
      customPublicUrl.includes("localhost") ||
      customPublicUrl.includes("127.0.0.1") ||
      customPublicUrl.includes("kong:8000");

    const publicUrl = isLocalDefault
      ? `/storage/v1/object/public/${STORAGE_BUCKET}/${data.path}`
      : `${customPublicUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${data.path}`;

    return NextResponse.json({ url: publicUrl, path: data.path });
  }

  // ── Local Disk Storage fallback ───────────────────────────────────────────
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir =
      process.env.LOCAL_UPLOAD_DIR ??
      path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    console.log(`[upload] File saved locally to ${path.join(uploadDir, filename)}`);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      path: filename,
    });
  } catch (err: any) {
    console.error("[upload] Local storage write error:", err?.message || err);
    return NextResponse.json(
      { error: `Local file upload failed: ${err?.message || err}` },
      { status: 500 },
    );
  }
}
