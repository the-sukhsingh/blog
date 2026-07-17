"use client";

import { Loader2, MessageSquare } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string | Date;
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const [comments, _setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          authorName: name.trim(),
          authorEmail: email.trim(),
          content: content.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit comment.");
      }

      setMessage({
        type: "success",
        text:
          data.message ??
          "Your comment was submitted and is awaiting moderation.",
      });
      setName("");
      setEmail("");
      setContent("");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-border/80 pt-12 space-y-8">
      <div className="flex items-center gap-2">
        <MessageSquare size={20} className="text-muted-foreground" />
        <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Comment List */}
      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-10 px-6 text-center text-muted-foreground bg-muted/10">
          <p className="text-sm font-semibold text-foreground/80">No comments yet.</p>
          <p className="text-xs mt-1">Be the first to share your thoughts.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-border/40 pb-6 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {comment.name}
                </span>
                <span>&middot;</span>
                <span className="font-mono">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Submission Form */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 space-y-6">
        <div>
          <h4 className="font-bold text-sm text-foreground">
            Add your comment
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your email address will not be published. Required fields are marked *
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="commenter-name"
                className="text-xs font-semibold text-foreground/80"
              >
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="commenter-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                disabled={submitting}
                className="h-10 w-full rounded-lg border border-border/85 bg-background px-3 text-sm outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/5 disabled:opacity-60"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="commenter-email"
                className="text-xs font-semibold text-foreground/80"
              >
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="commenter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                disabled={submitting}
                className="h-10 w-full rounded-lg border border-border/85 bg-background px-3 text-sm outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/5 disabled:opacity-60"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="commenter-content"
              className="text-xs font-semibold text-foreground/80"
            >
              Comment <span className="text-destructive">*</span>
            </label>
            <textarea
              id="commenter-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your comment here..."
              disabled={submitting}
              className="w-full rounded-lg border border-border/85 bg-background px-3 py-2.5 text-sm outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/5 resize-y min-h-[100px] disabled:opacity-60"
              required
            />
          </div>

          {message && (
            <div
              className={`rounded-lg px-4 py-3 text-xs font-semibold ${
                message.type === "success"
                  ? "bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400"
                  : "bg-destructive/10 border border-destructive/20 text-destructive"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-all duration-150 cursor-pointer active:translate-y-px"
          >
            {submitting && <Loader2 size={13} className="animate-spin" />}
            Submit Comment
          </button>
        </form>
      </div>
    </div>
  );
}
