import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ type: string; id: string }> };

// PATCH /api/admin/taxonomy/[type]/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, id } = await params;
  const body = await request.json();

  if (type === "category") {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.bgColorLight !== undefined && {
          bgColorLight: body.bgColorLight || null,
        }),
        ...(body.bgColorDark !== undefined && {
          bgColorDark: body.bgColorDark || null,
        }),
      },
    });
    return NextResponse.json(category);
  }

  if (type === "tag") {
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
      },
    });
    return NextResponse.json(tag);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

// DELETE /api/admin/taxonomy/[type]/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, id } = await params;

  if (type === "category") {
    await prisma.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  }

  if (type === "tag") {
    await prisma.tag.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(
    { error: "Invalid type. Use 'category' or 'tag'." },
    { status: 400 },
  );
}
