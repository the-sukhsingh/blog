"use client";

import { Edit2, ExternalLink, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string | Date;
  publishedAt: string | Date | null;
  author: { name: string | null };
  categories: { name: string }[];
  tags: { name: string }[];
}

interface PostListTableProps {
  initialPosts: Post[];
}

export default function PostListTable({ initialPosts }: PostListTableProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PUBLISHED" | "DRAFT"
  >("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch (_err) {
      alert("Error: Could not delete the post.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.slug.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || post.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-4 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="admin-status-filter"
            className="text-xs text-muted-foreground font-medium"
          >
            Status:
          </label>
          <select
            id="admin-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 rounded-md border border-border bg-background px-3 text-xs outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 font-medium">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Title &amp; Slug
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">
                Author
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPosts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-xs text-muted-foreground"
                >
                  {posts.length === 0 ? (
                    <>
                      No posts created yet.{" "}
                      <Link
                        href="/admin/posts/new"
                        className="underline hover:text-foreground"
                      >
                        Create your first post
                      </Link>
                    </>
                  ) : (
                    "No posts match the active filters."
                  )}
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground text-sm leading-snug">
                      {post.title}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      /posts/{post.slug}
                    </div>
                    {post.categories.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {post.categories.map((c) => (
                          <span
                            key={c.name}
                            className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        post.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {post.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {post.author.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                        title="View post on live site"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                        title="Edit post"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === post.id}
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete post"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
