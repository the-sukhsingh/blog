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
    <div className="space-y-8">
      {/* Moderation tabs */}
      <div className="flex gap-2 border-b border-border/80">
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
            className={`border-b-2 px-4 pb-3.5 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer -mb-px ${
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
      <div className="space-y-6">
        {displayedComments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground bg-muted/10">
            <MessageSquare className="mx-auto size-9 mb-3 opacity-30 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground/80">No comments found.</p>
            <p className="text-xs mt-1">
              There are no comments matching this category.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {displayedComments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-sm shadow-muted/5"
              >
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                    <span className="font-bold text-foreground text-sm">
                      {comment.name}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground/80 font-semibold">
                      <Mail size={13} className="opacity-75" />
                      {comment.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground/80 font-mono">
                      <Calendar size={13} className="opacity-75" />
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
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      comment.approved
                        ? "bg-green-500/10 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-amber-500/10 text-amber-700 dark:bg-amber-950/35 dark:text-amber-400"
                    }`}
                  >
                    {comment.approved ? "Approved" : "Pending Approval"}
                  </span>
                </div>

                {/* Comment Content */}
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/30 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground/85">
                    <FileText size={13} className="opacity-75" />
                    <span>On article:</span>
                    <Link
                      href={`/posts/${comment.post.slug}`}
                      target="_blank"
                      className="font-bold text-foreground hover:text-primary transition-colors hover:underline underline-offset-2"
                    >
                      {comment.post.title} ↗
                    </Link>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {!comment.approved && (
                      <button
                        type="button"
                        disabled={processingId === comment.id}
                        onClick={() => handleApprove(comment.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-60 transition-all duration-150 cursor-pointer active:translate-y-px"
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:text-destructive hover:border-destructive/30 disabled:opacity-60 transition-all duration-150 cursor-pointer active:translate-y-px"
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
