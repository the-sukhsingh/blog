/* Hallmark · component: admin-sidebar · genre: editorial · theme: editorial-studio
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Comment,
  Dashboard,
  Logout,
  Posts,
  SidebarLeft,
  SidebarRight,
  Tag,
  Users,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../theme/ThemeToggle";
import { Button } from "../ui/button";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: Dashboard },
  { href: "/admin/posts", label: "Posts", icon: Posts },
  { href: "/admin/taxonomy", label: "Taxonomy", icon: Tag },
  { href: "/admin/comments", label: "Comments", icon: Comment },
  { href: "/admin/users", label: "Users", icon: Users },
];

export interface SidebarProps {
  state?:
    | "default"
    | "hover"
    | "focus"
    | "active"
    | "disabled"
    | "loading"
    | "error"
    | "success";
  defaultCollapsed?: boolean;
}

const Sidebar = ({ state, defaultCollapsed = false }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const pathname = usePathname();
  const [optimisticActiveHref, setOptimisticActiveHref] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    if (pathname) {
      setOptimisticActiveHref(pathname);
    }
  }, [pathname]);

  // Detect keyboard shortcuts (Ctrl+B) to toggle sidebar
  React.useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable ||
        target.closest("[contenteditable='true']")
      ) {
        return;
      }

      if (e.key === "b" && e.ctrlKey) {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyboard);
    return () => {
      document.removeEventListener("keydown", handleKeyboard);
    };
  }, []);

  return (
    <div className="sticky h-dvh left-0 top-0 z-10">
      {/* Sidebar Container */}
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="shrink-0 border-r border-border bg-background"
      >
        <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
          {/* Brand & Toggle Header */}
          <div
            className={cn(
              "mb-8 flex items-center h-8",
              isCollapsed ? "px-0.5 justify-start" : "px-1 justify-between",
            )}
          >
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                disabled={state === "disabled"}
                className="group flex size-7 items-center justify-center rounded-lg border border-border bg-card text-foreground font-mono text-xs font-bold shadow-none select-none shrink-0 cursor-pointer active:scale-95 hover:border-foreground/30 transition-[border-color,transform] duration-100"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <>
                    <span className="group-hover:hidden">
                      {/* CONFIG:ADMIN_BRAND_INITIAL */}S{/* /CONFIG:ADMIN_BRAND_INITIAL */}
                    </span>
                    <SidebarRight className="hidden group-hover:block size-3.5" />
                  </>
                ) : (
                  /* CONFIG:ADMIN_BRAND_INITIAL */ "S" /* /CONFIG:ADMIN_BRAND_INITIAL */
                )}
              </button>
              <AnimatePresence mode="popLayout" initial={false}>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="font-mono text-xs font-bold tracking-[0.2em] text-foreground uppercase whitespace-nowrap"
                  >
                    {/* CONFIG:ADMIN_BRAND_NAME */}Studio{/* /CONFIG:ADMIN_BRAND_NAME */}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="relative active:scale-95 transition-transform duration-100 ease-out shrink-0 text-muted-foreground hover:text-foreground"
                disabled={state === "disabled"}
                aria-label="Collapse sidebar"
              >
                <SidebarLeft />
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-1 flex-col gap-1.5">
            {navLinks.map((link, index) => {
              const Icon = link.icon;

              // Override states for 8-state demonstration
              const isItemHovered = state === "hover" && index === 0;
              const isItemFocused = state === "focus" && index === 1;
              const isItemActive = state === "active" && index === 2;

              const currentActive = optimisticActiveHref || pathname;
              const isActive = isItemActive
                ? true
                : link.href === "/admin"
                  ? currentActive === "/admin"
                  : currentActive?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOptimisticActiveHref(link.href)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg p-2 text-[13px] tracking-tight font-medium transition-[color,background-color,transform] duration-150 ease-out outline-none select-none active:scale-[0.98]",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                    isItemHovered && "bg-secondary/60 text-foreground",
                    isItemFocused &&
                      "ring-2 ring-ring/50 border-input bg-secondary",
                    isItemActive &&
                      "scale-[0.97] bg-secondary/80 text-foreground",
                    state === "disabled" &&
                      "opacity-50 pointer-events-none cursor-not-allowed",
                    isCollapsed && "hover:translate-x-0 active:scale-95",
                  )}
                  tabIndex={state === "disabled" ? -1 : 0}
                >
                  {/* Sliding Pill Background for Active Link */}
                  {isActive && !isItemHovered && !isItemFocused && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 bg-secondary rounded-lg border border-border/40 -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}

                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-150 ease-out",
                      isItemActive && "scale-95",
                    )}
                  />

                  <AnimatePresence mode="popLayout" initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="whitespace-nowrap overflow-hidden text-xs flex-1 text-left"
                      >
                        {state === "loading" ? (
                          <div className="h-3 w-16 bg-muted-foreground/20 rounded animate-pulse" />
                        ) : (
                          link.label
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          {/* Status Indicator for Loading, Error, and Success */}
          {state === "error" && (
            <div
              className={cn(
                "mb-4 px-2.5 py-2 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-[10px] flex items-center gap-2 transition-[color,background-color] duration-150",
                isCollapsed ? "justify-center" : "",
              )}
            >
              <span className="size-1.5 rounded-full bg-destructive animate-pulse shrink-0" />
              {!isCollapsed && (
                <span className="font-semibold whitespace-nowrap overflow-hidden">
                  Sync failed
                </span>
              )}
            </div>
          )}

          {state === "success" && (
            <div
              className={cn(
                "mb-4 px-2.5 py-2 rounded-lg border border-border bg-muted text-foreground text-[10px] flex items-center gap-2 transition-[color,background-color] duration-150",
                isCollapsed ? "justify-center" : "",
              )}
            >
              <span className="size-1.5 rounded-full bg-foreground shrink-0" />
              {!isCollapsed && (
                <span className="font-semibold whitespace-nowrap overflow-hidden">
                  Saved & Synced
                </span>
              )}
            </div>
          )}

          {/* Bottom Controls (Sign Out and Mode Toggle) */}
          <div
            className={cn(
              "border-t border-border/60 pt-5 flex gap-2",
              isCollapsed
                ? "flex-col items-start gap-4"
                : "items-center justify-between",
            )}
          >
            <a
              href="/api/auth/signout"
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 text-xs font-semibold text-muted-foreground transition-[color,background-color,transform] duration-150 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] outline-none select-none focus-visible:ring-2 focus-visible:ring-destructive/30",
                isCollapsed && "flex-initial py-2.5",
                state === "disabled" &&
                  "opacity-50 pointer-events-none cursor-not-allowed",
              )}
              tabIndex={state === "disabled" ? -1 : 0}
            >
              <Logout className="opacity-80 **:stroke-current shrink-0" />
              {!isCollapsed && (
                <span className="whitespace-nowrap">Sign Out</span>
              )}
            </a>
            <ModeToggle
              className={cn(
                state === "disabled" &&
                  "opacity-50 pointer-events-none cursor-not-allowed",
              )}
            />
          </div>
        </div>
      </motion.aside>
    </div>
  );
};

export default Sidebar;
