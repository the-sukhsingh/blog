import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

function getUploadDir() {
  return (
    process.env.LOCAL_UPLOAD_DIR ??
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads")
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  try {
    const { path: pathParts } = await params;
    const filename = pathParts.join("/");
    const safeFilename = path.basename(filename);
    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, safeFilename);

    const fileBuffer = await fs.readFile(filePath);
    const ext = safeFilename.split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Object not found" }, { status: 404 });
  }
}
