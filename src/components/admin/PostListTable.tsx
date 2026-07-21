"use client";

import Link from "next/link";
import { noti } from "noti-toast";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditPen, LinkIcon, Search, TrashCan } from "@/lib/icons";
import { Badge } from "../ui/badge";

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
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PUBLISHED" | "DRAFT"
  >("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    noti.custom({
      id: `delete-id-${id}`,
      title: `Are you sure you want to delete "${title}"?`,
      description: "This action cannot be undone.",
      fillColor: "var(--color-muted)",
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id);
          try {
            const res = await fetch(`/api/admin/posts/${id}`, {
              method: "DELETE",
            });

            if (!res.ok) {
              throw new Error("Failed to delete post");
            }
            setPosts((prev) => prev.filter((p) => p.id !== id));
            noti.update(`delete-id-${id}`, {
              type: "success",
              title: "Deleted Successfully!",
              description: "The post has been deleted successfully.",
            });
          } catch (_err) {
            noti.update(`delete-id-${id}`, {
              type: "error",
              title: "Error",
              description: "Failed to delete post.",
            });
          } finally {
            setDeletingId(null);
          }
        },
      },
    });
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.slug.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || post.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const items = [
    { label: "All Statuses", value: "ALL" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Draft", value: "DRAFT" },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
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

          <Select
            id="admin-status-filter"
            items={items}
            value={statusFilter}
            onValueChange={(val) =>
              setStatusFilter(val as "ALL" | "PUBLISHED" | "DRAFT")
            }
          >
            <SelectTrigger className="">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table grid */}
      <div className="rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_1px_1px_rgba(255,255,255,0.05)] ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider">
                Title &amp; Slug
              </TableHead>
              <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider">
                Category
              </TableHead>
              <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider w-32">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider w-36">
                Author
              </TableHead>
              <TableHead className="px-6 py-4 text-[10px] uppercase tracking-wider w-36">
                Created
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-[10px] uppercase tracking-wider w-36">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-6 py-16 text-center text-xs text-muted-foreground whitespace-normal"
                >
                  {posts.length === 0 ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground/80 text-sm">
                        No posts created yet.
                      </p>
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
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id} className="group">
                  <TableCell className="px-6 py-4 whitespace-normal">
                    <div className="font-bold text-foreground text-[14px] leading-snug">
                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground/80 mt-1 select-all">
                      /posts/{post.slug}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.categories.map((c) => (
                          <Badge
                            variant={"outline"}
                            key={c.name}
                            className="py-1"
                          >
                            {c.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        post.status === "PUBLISHED"
                          ? "bg-green-500/10 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground/90"
                      }`}
                    >
                      {post.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs font-semibold text-foreground/80">
                    {post.author.name ?? "—"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs text-muted-foreground/90 font-mono">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="p-2 text-muted-foreground/80 hover:text-foreground hover:bg-muted/70 rounded-lg transition-all"
                        title="View post on live site"
                      >
                        <LinkIcon />
                      </Link>
                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="p-2 text-muted-foreground/80 hover:text-foreground hover:bg-muted/70 rounded-lg transition-all"
                        title="Edit post"
                      >
                        <EditPen />
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === post.id}
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 text-muted-foreground/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                        title="Delete post"
                      >
                        <TrashCan className="**:stroke-current shrink-0" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
