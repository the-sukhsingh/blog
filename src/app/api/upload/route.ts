import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { STORAGE_BUCKET, supabaseAdmin } from "@/lib/supabase";

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

    // Build the public URL
    // In Docker, SUPABASE_URL is the internal Kong address (http://kong:8000),
    // which is unreachable by browsers. SUPABASE_STORAGE_PUBLIC_URL is the
    // externally accessible URL. For cloud deployments both are the same, so
    // SUPABASE_STORAGE_PUBLIC_URL can simply be left unset (falls back to SUPABASE_URL).
    const publicBase =
      process.env.SUPABASE_STORAGE_PUBLIC_URL ?? process.env.SUPABASE_URL ?? "";
    const publicUrl = `${publicBase}/storage/v1/object/public/${STORAGE_BUCKET}/${data.path}`;

    return NextResponse.json({ url: publicUrl, path: data.path });
  }

  // ── Base64 fallback (dev — Supabase not configured) ───────────────────────
  console.warn(
    "[upload] SUPABASE_URL / SUPABASE_SERVICE_KEY not set. Using base64 fallback.",
  );
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  return NextResponse.json({
    url: dataUrl,
    warning:
      "Image stored as base64 (dev mode). Configure SUPABASE_URL and SUPABASE_SERVICE_KEY for persistent storage.",
  });
}
