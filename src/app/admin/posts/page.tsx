import type { Metadata } from "next";
import Link from "next/link";
import PostListTable from "@/components/admin/PostListTable";
import { AddSquare } from "@/lib/icons";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      category: { select: { name: true } },
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
          className="rounded-lg bg-primary pl-4 pr-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-150 cursor-pointer active:translate-y-px flex justify-center items-center gap-2"
        >
          <AddSquare className="**:stroke-current shrink-0 **:stroke-2" />
          New Post
        </Link>
      </div>

      <PostListTable initialPosts={posts as any} />
    </div>
  );
}
