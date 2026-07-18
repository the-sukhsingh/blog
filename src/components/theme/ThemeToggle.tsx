"use client";
import { useTheme } from "next-themes";
import { type SVGProps, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ModeToggle({ className = "" }: { className?: string }) {
  const { theme, systemTheme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    if (theme === "system") {
      if (systemTheme === "dark") {
        setTheme("light");
      } else {
        setTheme("dark");
      }
    } else {
      if (theme === "dark") {
        setTheme("light");
      } else {
        setTheme("dark");
      }
    }
  }, [theme, systemTheme, setTheme]);

  const handleThemeToggle = useCallback(() => {
    if (!document?.startViewTransition) {
      toggleTheme();
      return;
    }

    document.startViewTransition(() => {
      toggleTheme();
    });
  }, [toggleTheme]);

  useEffect(() => {
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

      if (e.key === "d") {
        e.preventDefault();
        console.log("toggling theme");
        handleThemeToggle();
      }
    };
    document.addEventListener("keydown", handleKeyboard);
    return () => {
      document.removeEventListener("keydown", handleKeyboard);
    };
  }, [handleThemeToggle]);

  return (
    <button
      aria-label="Toggle theme"
      aria-description="Toggle light & dark"
      onClick={handleThemeToggle}
      className={cn(
        "rounded-md size-8 flex justify-center items-center aspect-square h-fit relative overflow-hidden bg-accent active:translate-y-px shadow-inner/0 hover:shadow-inner transition-all duration-75 ease-out cursor-pointer",
        className,
      )}
      type="button"
    >
      {theme === "dark" || (theme === "system" && systemTheme === "dark") ? (
        <Moon className="absolute top-0 left-0 translate-y-1/2 translate-x-1/2 size-4" />
      ) : (
        <Sun className="size-4" />
      )}
    </button>
  );
}

const Sun = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <title>Sun Icon</title>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v1" />
    <path d="m18.364 5.636-.707.707" />
    <path d="M20 12h1" />
    <path d="m17.657 17.657.707.707" />
    <path d="M12 20v1" />
    <path d="m6.343 17.657-.707.707" />
    <path d="M3 12h1" />
    <path d="m5.636 5.636.707.707" />
  </svg>
);

const Moon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <title>Moon Icon</title>
    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
  </svg>
);
