import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/comments/[id] — approve or update a comment
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const comment = await prisma.comment.update({
    where: { id },
    data: {
      ...(body.approved !== undefined && { approved: body.approved }),
    },
  });

  return NextResponse.json(comment);
}

// DELETE /api/admin/comments/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.comment.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
