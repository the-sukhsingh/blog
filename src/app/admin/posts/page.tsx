import type { Metadata } from "next";
import Link from "next/link";
import PostListTable from "@/components/admin/PostListTable";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Posts",
};

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
      publishedAt: true,
      author: { select: { name: true } },
      categories: { select: { name: true } },
      tags: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.length} article{posts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors active:translate-y-px cursor-pointer"
        >
          + New Post
        </Link>
      </div>

      <PostListTable initialPosts={posts as any} />
    </div>
  );
}
