import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "The Journal — Editorial Studio",
  description:
    "Thoughtful essays, reviews, and technical guides written by content editors and publishers.",
};

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { name: true } },
      categories: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
    },
  });

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="space-y-16 py-4 md:py-8">
      {/* Brand Header */}
      <div className="border-b border-border/80 pb-10">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              The Journal
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed">
              Thoughtful essays, reviews, and technical guides. Written by
              content editors and publishers of The Editorial Studio.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/70">
              Est. {new Date().getFullYear()} &middot; Publishing Live
            </span>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-24 text-center text-muted-foreground bg-muted/10 max-w-2xl mx-auto">
          <p className="text-base font-semibold text-foreground">
            No articles published yet.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Head over to the{" "}
            <Link
              href="/admin/posts/new"
              className="underline hover:text-foreground font-medium transition-colors"
            >
              Admin CMS
            </Link>{" "}
            to publish your first piece.
          </p>
        </div>
      ) : (
        <div className="space-y-20">
          {/* Featured Post */}
          {featuredPost && (
            <article className="grid gap-8 md:grid-cols-12 md:gap-12 border-b border-border/60 pb-16 items-start">
              <div className="md:col-span-7 group">
                {featuredPost.coverImage ? (
                  <Link
                    href={`/posts/${featuredPost.slug}`}
                    className="block overflow-hidden rounded-2xl border border-border/60 bg-muted/30 aspect-[16/10]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.015] group-hover:opacity-95"
                    />
                  </Link>
                ) : (
                  <div className="aspect-[16/10] w-full rounded-2xl border border-dashed border-border bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
                    No cover image
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between md:col-span-5 space-y-6 py-2">
                <div className="space-y-4">
                  {featuredPost.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {featuredPost.categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          className="rounded-full bg-muted/80 hover:bg-primary hover:text-primary-foreground px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-all duration-200"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight sm:text-4xl hover:opacity-90 transition-opacity">
                    <Link href={`/posts/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  {featuredPost.excerpt && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground/90">
                      By {featuredPost.author.name ?? "Staff Writer"}
                    </span>
                    <span className="mt-0.5 font-mono text-[10px] tracking-tight">
                      {new Date(
                        featuredPost.publishedAt ?? featuredPost.createdAt,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Remaining Posts Feed */}
          {remainingPosts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  Latest Stories
                </h3>
              </div>
              <div className="divide-y divide-border/10">
                {remainingPosts.map((post) => (
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
