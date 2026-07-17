"use client";

import { Search, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { name: "Home", href: "/" },
  { name: "Search", href: "/search", icon: Search },
  { name: "Admin", href: "/admin", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const _isAdmin = pathname.startsWith("/admin");

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:py-5">
        <Link href="/" className="flex items-center gap-1.5 group">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-foreground">
            The
          </span>
          <span className="font-sans text-lg font-bold tracking-tight text-foreground transition-colors">
            Editorial Studio
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {links.map((link) => {
            // Admin link is active if pathname starts with /admin (except /admin/login is special but that's ok)
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                href={link.href}
                key={link.href}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground",
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {Icon && <Icon size={14} className="opacity-80" />}
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
