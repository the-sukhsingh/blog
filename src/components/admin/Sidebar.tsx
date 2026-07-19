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

  //   Detect keyboard shortcuts
  React.useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Check if input, textareas, or contenteditable editors are focused
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
    <div className="sticky h-dvh left-0 top-0 z-100">
      {/* Sidebar Container */}
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="shrink-0 border-r border-border/80 bg-sidebar/80 backdrop-blur-sm"
      >
        <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
          {/* Brand & Toggle Header */}
          <div
            className={cn(
              "mb-6 flex items-center gap-2 px-1 h-8",
              isCollapsed ? "justify-center" : "justify-between",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="font-semibold tracking-tight select-none whitespace-nowrap text-foreground text-sm"
                >
                  Admin
                </motion.span>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="relative active:scale-95 transition-transform shrink-0"
              disabled={state === "disabled"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isCollapsed ? (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <SidebarRight />
                  </motion.div>
                ) : (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, scale: 0.8, rotate: 45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: -45 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <SidebarLeft />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
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
                    "relative flex items-center gap-3 rounded-lg p-2 text-xs transition-all duration-200 outline-none select-none",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    isItemHovered && "bg-muted/80 text-foreground",
                    isItemFocused &&
                      "ring-2 ring-ring/50 border-input bg-muted",
                    isItemActive && "scale-[0.98] bg-muted/90 text-foreground",
                    state === "disabled" &&
                      "opacity-50 pointer-events-none cursor-not-allowed",
                    isCollapsed && "justify-center",
                  )}
                  tabIndex={state === "disabled" ? -1 : 0}
                >
                  {/* Sliding Pill Background for Active Link */}
                  {isActive && !isItemHovered && !isItemFocused && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 bg-muted rounded-lg -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}

                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-200",
                      isItemActive && "scale-95",
                    )}
                  />

                  <AnimatePresence mode="popLayout" initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
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
                "mb-4 px-2.5 py-2 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-[10px] flex items-center gap-2 transition-all duration-200",
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
                "mb-4 px-2.5 py-2 rounded-lg border border-border bg-muted text-foreground text-[10px] flex items-center gap-2 transition-all duration-200",
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
              "border-t border-border/60 pt-5 flex items-center gap-2",
              isCollapsed ? "flex-col justify-center" : "justify-between",
            )}
          >
            <a
              href="/api/auth/signout"
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 text-xs font-semibold text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] outline-none select-none focus-visible:ring-2 focus-visible:ring-destructive/30",
                isCollapsed && "justify-center flex-initial py-2.5",
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
