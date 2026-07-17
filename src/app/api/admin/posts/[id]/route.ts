import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlainTextFromJSON } from "@/lib/editor";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/posts/[id]
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      categories: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

// PATCH /api/admin/posts/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.content !== undefined && {
        content: body.content,
        contentText: getPlainTextFromJSON(body.content),
      }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
      ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
      ...(body.status !== undefined && {
        status: body.status,
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
      }),
      ...(body.categoryIds !== undefined && {
        categories: { set: (body.categoryIds as string[]).map((cid) => ({ id: cid })) },
      }),
      ...(body.tagIds !== undefined && {
        tags: { set: (body.tagIds as string[]).map((tid) => ({ id: tid })) },
      }),
    },
    include: {
      categories: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(post);
}

// DELETE /api/admin/posts/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.post.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
