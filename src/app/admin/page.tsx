import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Welcome back. Here&apos;s an overview of your blog.
      </p>

      {/* Metrics grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Published Posts", value: "—" },
          { label: "Draft Posts", value: "—" },
          { label: "Pending Comments", value: "—" },
          { label: "Total Users", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <a
          href="/admin/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Post
        </a>
        <a
          href="/admin/comments"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Moderate Comments
        </a>
      </div>
    </div>
  );
}
