import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ type: string; id: string }> };

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
