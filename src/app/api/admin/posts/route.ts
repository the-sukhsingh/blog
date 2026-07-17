import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPlainTextFromJSON } from "@/lib/editor";
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
      publishedAt: true,
      author: { select: { name: true } },
      categories: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true, slug: true } },
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

  const {
    title,
    slug,
    content,
    excerpt,
    coverImage,
    status,
    categoryIds,
    tagIds,
  } = body;

  if (!title || !slug) {
    return NextResponse.json(
      { error: "Title and slug are required" },
      { status: 400 },
    );
  }

  const authorId = (session.user as { id?: string }).id;
  if (!authorId) {
    return NextResponse.json(
      {
        error: "Session is missing user ID. Please sign out and sign in again.",
      },
      { status: 401 },
    );
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content: content ?? { type: "doc", content: [] },
      contentText: getPlainTextFromJSON(
        content ?? { type: "doc", content: [] },
      ),
      excerpt: excerpt ?? "",
      coverImage: coverImage ?? null,
      status: status ?? "DRAFT",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      authorId,
      categories: categoryIds?.length
        ? { connect: (categoryIds as string[]).map((id) => ({ id })) }
        : undefined,
      tags: tagIds?.length
        ? { connect: (tagIds as string[]).map((id) => ({ id })) }
        : undefined,
    },
    include: {
      categories: true,
      tags: true,
      author: { select: { name: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
