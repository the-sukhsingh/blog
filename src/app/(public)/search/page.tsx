import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";
import { Search} from "@/lib/icons"

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
      <div className="border-b border-border/80 pb-10">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Search
        </h1>
        <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed">
          Search for articles, categories, or tag names across our archives.
        </p>
      </div>

      <div className="max-w-2xl">
        <form method="GET" action="/search">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/80"
              />
              <input
                type="search"
                name="q"
                id="search-input"
                defaultValue={query}
                placeholder="Search by keywords, tags..."
                className="h-11 w-full rounded-xl border border-border/85 bg-background pl-11 pr-4 text-sm outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/5"
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/95 active:translate-y-px transition-all cursor-pointer"
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
            <div className="divide-y divide-border/10">
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
