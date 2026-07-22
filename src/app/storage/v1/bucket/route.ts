import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function getUploadDir() {
  return (
    process.env.LOCAL_UPLOAD_DIR ??
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads")
  );
}

export async function GET() {
  return NextResponse.json([
    {
      id: process.env.SUPABASE_BUCKET ?? "blog-media",
      name: process.env.SUPABASE_BUCKET ?? "blog-media",
      public: true,
    },
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const uploadDir = getUploadDir();
    await fs.mkdir(uploadDir, { recursive: true });
    const body = await request.json().catch(() => ({}));
    const name = body.name || process.env.SUPABASE_BUCKET || "blog-media";
    return NextResponse.json({ name, message: "Bucket created" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
