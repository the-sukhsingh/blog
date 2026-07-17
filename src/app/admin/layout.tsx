import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Tag,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ModeToggle } from "@/components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin",
  },
  description: "Blog CMS Administration",
};

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/taxonomy", label: "Taxonomy", icon: Tag },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border/80 bg-background/50 backdrop-blur-sm">
        <div className="sticky top-0 flex h-screen flex-col p-6">
          {/* Brand */}
          <Link
            href="/admin"
            className="mb-10 flex items-center gap-2.5 text-lg font-bold tracking-tight select-none"
          >
            <span className="font-heading">
              
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-muted-foreground transition-all duration-150 hover:bg-muted/80 hover:text-foreground"
                >
                  <Icon size={14} className="opacity-80" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Sign out and Mode Switcher */}
          <div className="border-t border-border/60 pt-5 flex items-center justify-between gap-2">
            <a
              href="/api/auth/signout"
              className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive flex-1"
            >
              <LogOut size={14} className="opacity-80" />
              Sign Out
            </a>
            <ModeToggle />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 max-w-6xl w-full p-6">{children}</main>
      </div>
    </div>
  );
}
