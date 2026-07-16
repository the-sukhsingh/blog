import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin",
  },
  description: "Blog CMS Administration",
};

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/posts", label: "Posts", icon: "✎" },
  { href: "/admin/taxonomy", label: "Taxonomy", icon: "⊕" },
  { href: "/admin/comments", label: "Comments", icon: "✉" },
  { href: "/admin/users", label: "Users", icon: "👤" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-muted/40">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          {/* Brand */}
          <Link
            href="/admin"
            className="mb-8 flex items-center gap-2 text-lg font-semibold"
          >
            <span className="rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
              CMS
            </span>
            Admin
          </Link>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Sign out */}
          <div className="border-t border-border pt-4">
            <a
              href="/api/auth/signout"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <span>↩</span>
              Sign Out
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
