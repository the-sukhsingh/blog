import { Clock, MessageSquare, PenTool, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const [publishedCount, draftCount, commentCount, userCount] =
    await Promise.all([
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.comment.count({ where: { approved: false } }),
      prisma.user.count(),
    ]);

  const recentPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  const pendingComments = await prisma.comment.findMany({
    where: { approved: false },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { post: { select: { title: true } } },
  });

  const stats = [
    { label: "Published Posts", value: publishedCount, icon: PenTool },
    { label: "Draft Posts", value: draftCount, icon: Clock },
    { label: "Pending Comments", value: commentCount, icon: MessageSquare },
    { label: "Total Users", value: userCount, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here&apos;s a live overview of your Editorial
          publication.
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <Icon size={16} className="text-muted-foreground/60" />
              </div>
              <p className="mt-2 text-3xl font-black tracking-tight text-foreground">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer active:translate-y-px"
        >
          + New Post
        </Link>
        <Link
          href="/admin/comments"
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent text-foreground transition-colors cursor-pointer active:translate-y-px"
        >
          Moderate Comments ({commentCount})
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Posts Panel */}
        <section className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <h2 className="text-sm font-bold text-foreground">Recent Posts</h2>
            <Link
              href="/admin/posts"
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              View all
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No posts found.
            </p>
          ) : (
            <div className="space-y-3.5">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="hover:underline"
                      >
                        {post.title}
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      By {post.author.name ?? "Staff"} &middot;{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      post.status === "PUBLISHED"
                        ? "bg-green-150 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {post.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Comments Panel */}
        <section className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <h2 className="text-sm font-bold text-foreground">
              Pending Comments
            </h2>
            <Link
              href="/admin/comments"
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Manage
            </Link>
          </div>

          {pendingComments.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No comments awaiting moderation.
            </p>
          ) : (
            <div className="space-y-3.5">
              {pendingComments.map((comment) => (
                <div key={comment.id} className="text-sm space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {comment.name}
                    </span>
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-foreground line-clamp-2 leading-relaxed bg-muted/30 p-2 rounded border border-border/30">
                    &ldquo;{comment.content}&rdquo;
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    On post:{" "}
                    <span className="font-medium text-foreground">
                      {comment.post.title}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
