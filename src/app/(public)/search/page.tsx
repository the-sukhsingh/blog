import { Search } from "lucide-react";
import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";

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
    <div className="space-y-8">
      <div className="border-b border-border pb-8 pt-2">
        <h1 className="font-sans text-4xl font-black tracking-tight text-foreground">
          Search
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Search for articles, categories, or tag names across our archives.
        </p>
      </div>

      <div className="max-w-2xl">
        <form method="GET" action="/search">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                name="q"
                id="search-input"
                defaultValue={query}
                placeholder="Search by keywords, tags..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:translate-y-px transition-all cursor-pointer"
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
                Found{" "}
                <span className="font-medium text-foreground">
                  {posts.length}
                </span>{" "}
                result
                {posts.length !== 1 ? "s" : ""} for{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            ) : (
              <>
                No results for{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{query}&rdquo;
                </span>
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
