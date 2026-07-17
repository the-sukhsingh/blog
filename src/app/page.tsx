import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Home — Blog",
  description: "Browse our latest articles, stories, and guides.",
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
    <div className="space-y-12">
      {/* Editorial Title / Brand message */}
      <div className="border-b border-border pb-8 pt-2">
        <h1 className="font-sans text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          The Journal
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
          Thoughtful essays, reviews, and technical guides. Written by content
          editors and publishers of The Editorial Studio.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground bg-muted/20">
          <p className="text-base font-medium">No articles published yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Head to{" "}
            <a
              href="/admin/posts/new"
              className="underline hover:text-foreground"
            >
              Admin CMS
            </a>{" "}
            to publish your first piece.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Featured Post */}
          {featuredPost && (
            <article className="grid gap-6 md:grid-cols-12 md:gap-8 border-b border-border pb-12">
              <div className="md:col-span-7">
                {featuredPost.coverImage ? (
                  <a
                    href={`/posts/${featuredPost.slug}`}
                    className="block overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-200 hover:scale-[1.01]"
                    />
                  </a>
                ) : (
                  <div className="aspect-[16/10] w-full rounded-xl border border-dashed border-border bg-muted/40 flex items-center justify-center text-muted-foreground text-sm">
                    No cover image
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center md:col-span-5 space-y-4">
                {featuredPost.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {featuredPost.categories.map((cat) => (
                      <a
                        key={cat.slug}
                        href={`/categories/${cat.slug}`}
                        className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {cat.name}
                      </a>
                    ))}
                  </div>
                )}

                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  <a
                    href={`/posts/${featuredPost.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {featuredPost.title}
                  </a>
                </h2>

                {featuredPost.excerpt && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                )}

                <div className="text-xs text-muted-foreground font-medium pt-2">
                  <span>By {featuredPost.author.name ?? "Staff Writer"}</span>
                  <span className="mx-2">&middot;</span>
                  <span>
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
            </article>
          )}

          {/* Remaining Posts Grid */}
          {remainingPosts.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                More Stories
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
