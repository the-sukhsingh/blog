import type { Prisma } from "@prisma/client";
import { X } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import Link from "next/link";
import PostCard from "@/components/PostCard";
import { FolderOpen, Search, Tag } from "@/lib/icons";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search & Browse",
  description:
    "Search for articles or filter by category and tags across our archives.",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, category, tag } = await searchParams;
  const query = q?.trim() ?? "";
  const categorySlug = category?.trim() ?? "";
  const tagSlug = tag?.trim() ?? "";

  // Fetch all categories & tags that have at least one published post, with their post count
  const [allCategories, allTags] = await Promise.all([
    prisma.category.findMany({
      where: {
        posts: {
          some: { status: "PUBLISHED" },
        },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            posts: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    }),
    prisma.tag.findMany({
      where: {
        posts: {
          some: { status: "PUBLISHED" },
        },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            posts: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    }),
  ]);

  // Find active category & tag in fetched list to display human-readable names
  const activeCategory = categorySlug
    ? allCategories.find((c) => c.slug === categorySlug) || {
        name: categorySlug,
        slug: categorySlug,
      }
    : null;
  const activeTag = tagSlug
    ? allTags.find((t) => t.slug === tagSlug) || {
        name: tagSlug,
        slug: tagSlug,
      }
    : null;

  // Construct query where clause
  const whereClause: Prisma.PostWhereInput = {
    status: "PUBLISHED",
  };

  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { contentText: { contains: query, mode: "insensitive" } },
      {
        tags: {
          some: { name: { contains: query, mode: "insensitive" } },
        },
      },
      {
        category: {
          name: { contains: query, mode: "insensitive" },
        },
      },
    ];
  }

  if (categorySlug) {
    whereClause.category = {
      slug: categorySlug,
    };
  }

  if (tagSlug) {
    whereClause.tags = {
      some: { slug: tagSlug },
    };
  }

  const isDefaultView = !query && !categorySlug && !tagSlug;

  // Fetch filtered posts (or recent posts by default)
  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
    },
    ...(isDefaultView ? { take: 10 } : {}),
  });

  // URL construction helper for filters
  const createSearchUrl = (params: {
    q?: string;
    category?: string;
    tag?: string;
  }) => {
    const searchParamsObj = new URLSearchParams();

    // Process search query
    if (params.q !== undefined) {
      if (params.q.trim()) searchParamsObj.set("q", params.q.trim());
    } else if (query) {
      searchParamsObj.set("q", query);
    }

    // Process category
    if (params.category !== undefined) {
      if (params.category) searchParamsObj.set("category", params.category);
    } else if (categorySlug) {
      searchParamsObj.set("category", categorySlug);
    }

    // Process tag
    if (params.tag !== undefined) {
      if (params.tag) searchParamsObj.set("tag", params.tag);
    } else if (tagSlug) {
      searchParamsObj.set("tag", tagSlug);
    }

    const searchStr = searchParamsObj.toString();
    return searchStr ? `/search?${searchStr}` : "/search";
  };

  return (
    <div className="space-y-10 py-4 md:py-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-10">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Search
        </h1>
        <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed">
          Search for articles, categories, or tags across our archives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        {/* Main Content: Search Bar, Active Filters, results */}
        <div className="lg:col-span-3 space-y-8">
          <div className="max-w-2xl">
            <form method="GET" action="/search">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
                  <input
                    type="search"
                    name="q"
                    id="search-input"
                    defaultValue={query}
                    placeholder="Search by keywords, tags..."
                    className="h-11 w-full rounded-xl border border-border/85 bg-background pl-11 pr-4 text-sm outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/5"
                  />
                </div>
                {categorySlug && (
                  <input type="hidden" name="category" value={categorySlug} />
                )}
                {tagSlug && <input type="hidden" name="tag" value={tagSlug} />}
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/95 active:translate-y-px transition-all cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Active Filters Row */}
          {(query || categorySlug || tagSlug) && (
            <div className="flex flex-wrap items-center gap-3 bg-muted/20 border border-border/50 rounded-xl p-4">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80">
                Active Filters:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {query && (
                  <Link
                    href={createSearchUrl({ q: "" })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-background border border-border/80 pl-3 pr-2 py-1 text-xs font-medium text-foreground hover:border-primary/50 transition-colors group"
                  >
                    <span>Query: &ldquo;{query}&rdquo;</span>
                    <X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                )}

                {categorySlug && activeCategory && (
                  <Link
                    href={createSearchUrl({ category: "" })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-background border border-border/80 pl-3 pr-2 py-1 text-xs font-medium text-foreground hover:border-primary/50 transition-colors group"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Category: {activeCategory.name}</span>
                    <X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                )}

                {tagSlug && activeTag && (
                  <Link
                    href={createSearchUrl({ tag: "" })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-background border border-border/80 pl-3 pr-2 py-1 text-xs font-medium text-foreground hover:border-primary/50 transition-colors group"
                  >
                    <Tag className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Tag: #{activeTag.name}</span>
                    <X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                )}

                <Link
                  href="/search"
                  className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 pl-2 font-medium transition-colors"
                >
                  Clear all
                </Link>
              </div>
            </div>
          )}

          {/* Results Area */}
          {isDefaultView ? (
            <div>
              <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border/40 select-none">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  Recent Articles
                </h3>
              </div>
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
                      category={post.category}
                      tags={post.tags}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
                  <p className="text-lg font-medium">No articles found.</p>
                  <p className="mt-1 text-sm">
                    Be the first to publish a post in the dashboard.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="mb-6 text-sm text-muted-foreground">
                {posts.length > 0 ? (
                  <>
                    Found{" "}
                    <span className="font-medium text-foreground">
                      {posts.length}
                    </span>{" "}
                    result
                    {posts.length !== 1 ? "s" : ""} matching your filters:
                  </>
                ) : (
                  "No results matching your filters."
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
                      category={post.category}
                      tags={post.tags}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground bg-muted/5">
                  <p className="text-lg font-medium text-foreground/80">
                    No results found.
                  </p>
                  <p className="mt-1 text-sm">
                    Try a different keyword or reset filters to see{" "}
                    <Link
                      href="/search"
                      className="underline hover:text-foreground font-semibold"
                    >
                      recent articles
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Filters */}
        <div className="space-y-8 lg:sticky lg:top-8">
          {/* Categories Card */}
          <div className="rounded-2xl border border-border/60 p-6 bg-muted/5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/40 select-none">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Categories
              </h3>
            </div>
            {allCategories.length === 0 ? (
              <p className="text-xs text-muted-foreground/80 italic p-2">
                No categories available.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {allCategories.map((cat) => {
                  const isSelected = categorySlug === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={createSearchUrl({
                        category: isSelected ? "" : cat.slug,
                      })}
                      className={cn(
                        "flex items-center justify-between py-1.5 px-2.5 rounded-lg text-sm transition-all duration-200 group",
                        isSelected
                          ? "bg-primary/5 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all duration-200",
                            isSelected
                              ? "bg-primary scale-110"
                              : "bg-transparent group-hover:bg-muted-foreground/30",
                          )}
                        />
                        {cat.name}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] px-2 py-0.5 rounded-full font-mono transition-all duration-200",
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                        )}
                      >
                        {cat._count.posts}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags Card */}
          <div className="rounded-2xl border border-border/60 p-6 bg-muted/5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/40 select-none">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Tags
              </h3>
            </div>
            {allTags.length === 0 ? (
              <p className="text-xs text-muted-foreground/80 italic p-2">
                No tags available.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => {
                  const isSelected = tagSlug === t.slug;
                  return (
                    <Link
                      key={t.id}
                      href={createSearchUrl({ tag: isSelected ? "" : t.slug })}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all duration-200 active:scale-95",
                        isSelected
                          ? "bg-primary text-primary-foreground font-medium hover:bg-primary/95 shadow-sm shadow-primary/10"
                          : "border border-border bg-background text-muted-foreground hover:border-muted-foreground/45 hover:text-foreground",
                      )}
                    >
                      #{t.name}
                      <span
                        className={cn(
                          "text-[10px] font-mono",
                          isSelected
                            ? "opacity-90"
                            : "text-muted-foreground/60",
                        )}
                      >
                        ({t._count.posts})
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
