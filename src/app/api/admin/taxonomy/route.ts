import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/taxonomy — list all categories and tags
// Public read: used by PostForm on the client before auth check
export async function GET(_request: NextRequest) {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({ categories, tags });
}

// POST /api/admin/taxonomy — create category or tag (auth required)
// Body: { type: "category" | "tag", name: string, slug: string }
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, name, slug } = body;

  if (!type || !name || !slug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (type === "category") {
    const category = await prisma.category.create({ data: { name, slug } });
    return NextResponse.json(category, { status: 201 });
  }

  if (type === "tag") {
    const tag = await prisma.tag.create({ data: { name, slug } });
    return NextResponse.json(tag, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
