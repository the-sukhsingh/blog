import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users — list all users (ADMIN only)
export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

// POST /api/admin/users — create a new user (ADMIN only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // Password hashing will be done in the implementation layer
  // TODO: validate and hash password before storing
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash: body.passwordHash, // caller must hash before sending
      role: body.role ?? "EDITOR",
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
