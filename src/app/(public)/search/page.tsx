import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for articles by keyword, title, or tag.",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const posts = query
    ? await prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { contentText: { contains: query, mode: "insensitive" } },
            {
              tags: {
                some: { name: { contains: query, mode: "insensitive" } },
              },
            },
            {
              categories: {
                some: { name: { contains: query, mode: "insensitive" } },
              },
            },
          ],
        },
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true } },
          categories: { select: { name: true, slug: true } },
          tags: { select: { name: true, slug: true } },
        },
      })
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Search</h1>
        <form method="GET" action="/search">
          <div className="relative flex items-center">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 text-muted-foreground"
            />
            <input
              type="search"
              name="q"
              id="search-input"
              defaultValue={query}
              placeholder="Search articles, categories, tags…"
              className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
            <button
              type="submit"
              className="ml-2 h-11 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {query ? (
        <div>
          <p className="mb-6 text-sm text-muted-foreground">
            {posts.length > 0 ? (
              <>
                Found <span className="font-medium text-foreground">{posts.length}</span> result
                {posts.length !== 1 ? "s" : ""} for{" "}
                <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              <>
                No results for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
              </>
            )}
          </p>

          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  coverImage={post.coverImage}
                  publishedAt={post.publishedAt}
                  createdAt={post.createdAt}
                  author={post.author}
                  categories={post.categories}
                  tags={post.tags}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
              <p className="text-lg font-medium">No results found.</p>
              <p className="mt-1 text-sm">
                Try a different keyword or browse by{" "}
                <a href="/" className="underline hover:text-foreground">
                  latest posts
                </a>
                .
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Enter a keyword above to search for articles.
        </p>
      )}
    </div>
  );
}
