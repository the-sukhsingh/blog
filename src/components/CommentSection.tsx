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
    <div className="mt-16 border-t border-border pt-10">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare size={18} className="text-muted-foreground" />
        <h3 className="font-sans text-xl font-bold tracking-tight text-foreground">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Comment List */}
      {comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground mb-10 bg-muted/10">
          <p className="text-sm font-medium">No comments yet.</p>
          <p className="text-xs mt-1">Be the first to share your thoughts.</p>
        </div>
      ) : (
        <div className="space-y-6 mb-12">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-border/40 pb-5 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2 mb-2 text-xs">
                <span className="font-semibold text-foreground">
                  {comment.name}
                </span>
                <span className="text-muted-foreground">&middot;</span>
                <span className="text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Submission Form */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h4 className="font-semibold text-sm mb-4 text-foreground">
          Add a comment
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="commenter-name"
                className="text-xs font-medium text-muted-foreground"
              >
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="commenter-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                disabled={submitting}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="commenter-email"
                className="text-xs font-medium text-muted-foreground"
              >
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="commenter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (will not be published)"
                disabled={submitting}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="commenter-content"
              className="text-xs font-medium text-muted-foreground"
            >
              Comment <span className="text-destructive">*</span>
            </label>
            <textarea
              id="commenter-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are your thoughts?"
              disabled={submitting}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 resize-y min-h-[80px]"
              required
            />
          </div>

          {message && (
            <div
              className={`rounded-md px-3 py-2 text-xs font-medium ${
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
            className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {submitting && <Loader2 size={12} className="animate-spin" />}
            Submit Comment
          </button>
        </form>
      </div>
    </div>
  );
}
