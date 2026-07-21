import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/users/[id] — update user details (ADMIN only)
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, email, password, role: userRole } = body;

    // Check if email format is correct if email is updated
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        );
      }

      // Check if duplicate email
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          NOT: { id },
        },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 },
        );
      }
    }

    const data: any = {};
    if (name !== undefined) data.name = name || null;
    if (email !== undefined) data.email = email.toLowerCase().trim();
    if (userRole !== undefined)
      data.role = userRole === "ADMIN" ? "ADMIN" : "EDITOR";
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 },
        );
      }
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json(
      { error: "Could not update user" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users/[id] — delete user (ADMIN only)
export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent users from deleting themselves
  const currentUserId = (session.user as { id?: string })?.id;
  if (currentUserId === id) {
    return NextResponse.json(
      {
        error:
          "Self-deletion is forbidden. You cannot delete your own account.",
      },
      { status: 400 },
    );
  }

  try {
    // Delete user
    await prisma.user.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not delete user" },
      { status: 500 },
    );
  }
}
