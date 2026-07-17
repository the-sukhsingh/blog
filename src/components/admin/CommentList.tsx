"use client";

import {
  Calendar,
  Check,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: string | Date;
  post: { title: string; slug: string };
}

interface CommentListProps {
  initialComments: Comment[];
}

export default function CommentList({ initialComments }: CommentListProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED">(
    "PENDING",
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });

      if (!res.ok) {
        throw new Error("Failed to approve comment");
      }

      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, approved: true } : c)),
      );
      router.refresh();
    } catch (_err) {
      alert("Error: Could not approve comment.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (_err) {
      alert("Error: Could not delete comment.");
    } finally {
      setProcessingId(null);
    }
  };

  // Filter lists
  const pendingComments = comments.filter((c) => !c.approved);
  const approvedComments = comments.filter((c) => c.approved);

  const displayedComments =
    activeTab === "PENDING"
      ? pendingComments
      : activeTab === "APPROVED"
        ? approvedComments
        : comments;

  return (
    <div className="space-y-6">
      {/* Moderation tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { key: "PENDING", label: "Pending", count: pendingComments.length },
          {
            key: "APPROVED",
            label: "Approved",
            count: approvedComments.length,
          },
          { key: "ALL", label: "All Comments", count: comments.length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`border-b-2 px-4 pb-3 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer -mb-px ${
              activeTab === tab.key
                ? "border-primary text-foreground font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Moderation List */}
      <div className="space-y-4">
        {displayedComments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground bg-muted/10">
            <MessageSquare className="mx-auto size-8 mb-3 opacity-30" />
            <p className="text-sm font-medium">No comments found.</p>
            <p className="text-xs mt-1">
              There are no comments matching this category.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayedComments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-lg border border-border bg-card p-5 space-y-3"
              >
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="font-bold text-foreground">
                      {comment.name}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Mail size={12} />
                      {comment.email}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar size={12} />
                      {new Date(comment.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      comment.approved
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-400"
                    }`}
                  >
                    {comment.approved ? "Approved" : "Pending Approval"}
                  </span>
                </div>

                {/* Comment Content */}
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/30 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText size={12} />
                    <span>On article:</span>
                    <Link
                      href={`/posts/${comment.post.slug}`}
                      target="_blank"
                      className="font-semibold text-foreground hover:underline"
                    >
                      {comment.post.title} ↗
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    {!comment.approved && (
                      <button
                        type="button"
                        disabled={processingId === comment.id}
                        onClick={() => handleApprove(comment.id)}
                        className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 disabled:opacity-55 cursor-pointer active:translate-y-px transition-all"
                      >
                        {processingId === comment.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        Approve
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={processingId === comment.id}
                      onClick={() => handleDelete(comment.id)}
                      className="inline-flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:text-destructive hover:border-destructive/30 disabled:opacity-55 cursor-pointer active:translate-y-px transition-all"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
