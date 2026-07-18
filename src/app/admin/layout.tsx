import type { Metadata } from "next";
import Link from "next/link";
import { ModeToggle } from "@/components/theme/ThemeToggle";
import Sidebar from "../../components/admin/Sidebar";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin",
  },
  description: "Blog CMS Administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 max-w-6xl w-full mx-auto p-6">{children}</main>
      </div>
    </div>
  );
}
