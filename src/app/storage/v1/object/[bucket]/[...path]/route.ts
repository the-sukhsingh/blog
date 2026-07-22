import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function getUploadDir() {
  return (
    process.env.LOCAL_UPLOAD_DIR ??
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads")
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  try {
    const { bucket, path: pathParts } = await params;
    const filename = pathParts.join("/");
    const safeFilename = path.basename(filename);
    const uploadDir = getUploadDir();

    await fs.mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = path.join(uploadDir, safeFilename);
    await fs.writeFile(filePath, buffer);

    console.log(`[Supabase Storage API] Stored ${safeFilename} (${buffer.length} bytes) to ${filePath}`);

    return NextResponse.json(
      {
        Id: safeFilename,
        Key: `${bucket}/${safeFilename}`,
        path: safeFilename,
        fullPath: `${bucket}/${safeFilename}`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[Supabase Storage API] Upload error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
