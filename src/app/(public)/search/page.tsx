import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for articles by keyword, title, or tag.",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Search</h1>

      <form method="GET" action="/search" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search articles..."
            className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </div>
      </form>

      {q ? (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            Results for: <span className="font-medium">&ldquo;{q}&rdquo;</span>
          </p>
          <div className="grid gap-6">
            <p className="text-muted-foreground">No results found.</p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">
          Enter a keyword above to search for articles.
        </p>
      )}
    </div>
  );
}
