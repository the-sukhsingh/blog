"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/theme/ThemeToggle";
import { Search } from "@/lib/icons";
import { cn } from "@/lib/utils";

const links = [
  { name: "Home", href: "/" },
  { name: "Search", href: "/search", icon: Search },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:py-5">
        <Link href="/" className="flex items-center gap-1.5 group select-none">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/80 transition-colors group-hover:text-foreground">
            The
          </span>
          <span className="font-heading text-lg font-black tracking-tight text-foreground transition-colors">
            Editorial Studio
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-5">
            {links.map((link) => {
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
                    "flex items-center gap-1.5 text-xs font-semibold tracking-tight transition-colors hover:text-foreground py-1",
                    isActive
                      ? "text-foreground border-b border-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {Icon && <Icon className="size-3 opacity-70" />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <span className="h-4 w-px bg-border/80" />

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
