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
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
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
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-muted/50"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <Icon
                  size={15}
                  className="text-muted-foreground/60 transition-colors group-hover:text-primary"
                />
              </div>
              <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-foreground">
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
          className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-150 cursor-pointer active:translate-y-px"
        >
          + New Post
        </Link>
        <Link
          href="/admin/comments"
          className="rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted/70 transition-all duration-150 cursor-pointer active:translate-y-px"
        >
          Moderate Comments ({commentCount})
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Posts Panel */}
        <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm shadow-muted/5">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Recent Posts
            </h2>
            <Link
              href="/admin/posts"
              className="text-xs text-muted-foreground hover:text-foreground font-semibold underline underline-offset-2"
            >
              View all
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No posts found.
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-sm text-foreground hover:text-primary transition-colors">
                      <Link href={`/admin/posts/edit/${post.id}`}>
                        {post.title}
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      By {post.author.name ?? "Staff"} &middot;{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      post.status === "PUBLISHED"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
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
        <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm shadow-muted/5">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Pending Comments
            </h2>
            <Link
              href="/admin/comments"
              className="text-xs text-muted-foreground hover:text-foreground font-semibold underline underline-offset-2"
            >
              Manage
            </Link>
          </div>

          {pendingComments.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No comments awaiting moderation.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingComments.map((comment) => (
                <div
                  key={comment.id}
                  className="text-sm space-y-2 pb-4 border-b border-border/30 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">
                      {comment.name}
                    </span>
                    <span className="font-mono">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed bg-muted/40 p-3 rounded-lg border border-border/30">
                    &ldquo;{comment.content}&rdquo;
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    On post:{" "}
                    <span className="font-semibold text-foreground/80">
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
