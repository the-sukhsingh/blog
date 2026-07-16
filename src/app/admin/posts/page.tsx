import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Posts",
};

export default function AdminPostsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your blog articles.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {["All", "Published", "Draft"].map((filter) => (
          <button
            key={filter}
            type="button"
            className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-accent"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Posts table */}
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Author
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No posts yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
