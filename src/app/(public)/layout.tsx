import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default:
      /* CONFIG:SITE_TITLE_DEFAULT */ "Blog" /* /CONFIG:SITE_TITLE_DEFAULT */,
    template:
      /* CONFIG:SITE_TITLE_TEMPLATE */ "%s | Blog" /* /CONFIG:SITE_TITLE_TEMPLATE */,
  },
  description:
    /* CONFIG:SITE_META_DESC */ "A modern blog platform with articles, categories, and tags." /* /CONFIG:SITE_META_DESC */,
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        {children}
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {/* CONFIG:FOOTER_TEXT */}Blog. All rights reserved.{/* /CONFIG:FOOTER_TEXT */}
        </p>
      </footer>
    </div>
  );
}
