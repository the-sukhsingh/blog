import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Blog",
    template: "%s | Blog",
  },
  description: "A modern blog platform with articles, categories, and tags.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <a href="/" className="text-xl font-bold tracking-tight">
            Blog
          </a>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a
              href="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </a>
            <a
              href="/search"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Search
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        {children}
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}
