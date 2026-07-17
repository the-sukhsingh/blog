import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import UserManager from "@/components/admin/UserManager";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (role !== "ADMIN") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20 mb-4">
          <ShieldAlert size={20} />
        </div>
        <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
          You must have administrator privileges to view or manage user
          accounts. Please contact your administrator.
        </p>
      </div>
    );
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Users
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and manage system user accounts for content editors and
          administrators.
        </p>
      </div>

      <UserManager initialUsers={users as any} />
    </div>
  );
}
