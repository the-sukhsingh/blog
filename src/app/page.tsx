import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";

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

  return (
    <div>
      <div className="mb-10">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Latest Posts</h1>
        <p className="text-muted-foreground">
          Browse our latest articles, stories, and guides.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">No posts yet.</p>
          <p className="mt-1 text-sm">
            Head to{" "}
            <a href="/admin/posts/new" className="underline hover:text-foreground">
              Admin → New Post
            </a>{" "}
            to publish your first article.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
