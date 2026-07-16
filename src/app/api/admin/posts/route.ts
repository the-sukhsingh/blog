import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/posts — list all posts (drafts + published)
export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  return NextResponse.json(posts);
}

// POST /api/admin/posts — create a new post
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // TODO: validate body with zod
  const post = await prisma.post.create({
    data: {
      title: body.title,
      slug: body.slug,
      content: body.content ?? "",
      excerpt: body.excerpt ?? "",
      coverImage: body.coverImage ?? null,
      status: body.status ?? "DRAFT",
      authorId: (session.user as { id?: string }).id as string,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
