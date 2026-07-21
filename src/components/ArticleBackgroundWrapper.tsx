"use client";

import type React from "react";

interface ArticleBackgroundWrapperProps {
  bgColorLight?: string | null;
  bgColorDark?: string | null;
  children: React.ReactNode;
  className?: string;
}

export default function ArticleBackgroundWrapper({
  bgColorLight,
  bgColorDark,
  children,
  className = "",
}: ArticleBackgroundWrapperProps) {
  return (
    <div
      className={`transition-colors duration-300 rounded-3xl ${className}`}
      style={
        {
          "--custom-bg-light": bgColorLight || undefined,
          "--custom-bg-dark": bgColorDark || undefined,
        } as React.CSSProperties
      }
      data-custom-bg-light={bgColorLight ? "true" : undefined}
      data-custom-bg-dark={bgColorDark ? "true" : undefined}
    >
      <style jsx global>{`
        .dark [data-custom-bg-dark="true"] {
          background-color: var(--custom-bg-dark) !important;
        }
        :not(.dark) [data-custom-bg-light="true"] {
          background-color: var(--custom-bg-light);
        }
      `}</style>
      {children}
    </div>
  );
}
