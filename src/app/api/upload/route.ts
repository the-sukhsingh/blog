import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: receive file, upload to Supabase Storage, return public URL
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  return NextResponse.json(
    { url: null, message: "Upload handler not yet implemented." },
    { status: 501 },
  );
}
