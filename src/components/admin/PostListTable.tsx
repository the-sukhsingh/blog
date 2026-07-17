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
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title or slug..."
            className="h-10 w-full rounded-xl border border-border/85 bg-background pl-10 pr-4 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5"
          />
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="admin-status-filter"
            className="text-xs text-muted-foreground font-semibold uppercase tracking-wider"
          >
            Status
          </label>
          <select
            id="admin-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 rounded-xl border border-border/85 bg-background px-4 py-1 text-xs font-semibold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-sm shadow-muted/5">
        <table className="w-full text-sm border-collapse">
          <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-wider">
                Title &amp; Slug
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-wider w-32">
                Status
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-wider w-36">
                Author
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-wider w-36">
                Created
              </th>
              <th className="px-6 py-4 text-right text-[10px] uppercase tracking-wider w-36">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredPosts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-xs text-muted-foreground"
                >
                  {posts.length === 0 ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground/80 text-sm">No posts created yet.</p>
                      <p className="text-xs">
                        Get started by{" "}
                        <Link
                          href="/admin/posts/new"
                          className="underline hover:text-foreground font-semibold text-primary"
                        >
                          creating your first post
                        </Link>
                      </p>
                    </div>
                  ) : (
                    "No posts match the active filters."
                  )}
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-muted/15 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground text-[14px] leading-snug">
                      <Link href={`/admin/posts/edit/${post.id}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground/80 mt-1 select-all">
                      /posts/{post.slug}
                    </div>
                    {post.categories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {post.categories.map((c) => (
                          <span
                            key={c.name}
                            className="rounded bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground/90 uppercase tracking-wider"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        post.status === "PUBLISHED"
                          ? "bg-green-500/10 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground/90"
                      }`}
                    >
                      {post.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-foreground/80">
                    {post.author.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground/90 font-mono">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="p-2 text-muted-foreground/80 hover:text-foreground hover:bg-muted/70 rounded-lg transition-all"
                        title="View post on live site"
                      >
                        <ExternalLink size={13} />
                      </Link>
                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="p-2 text-muted-foreground/80 hover:text-foreground hover:bg-muted/70 rounded-lg transition-all"
                        title="Edit post"
                      >
                        <Edit2 size={13} />
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === post.id}
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 text-muted-foreground/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                        title="Delete post"
                      >
                        <Trash2 size={13} />
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
