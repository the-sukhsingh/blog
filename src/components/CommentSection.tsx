"use client";

import { Loader2, MessageSquare, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { PaperPlane } from "@/lib/icons";

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string | Date;
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  allowComments: boolean;
}

function getAvatarStyle(name: string) {
  const styles = [
    "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    "from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    "from-emerald-500/10 to-teal-500/10 text-teal-600 dark:text-teal-400 border-emerald-500/20",
    "from-amber-500/10 to-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    "from-violet-500/10 to-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % styles.length;
  return styles[index];
}

export default function CommentSection({
  postId,
  initialComments,
  allowComments,
}: CommentSectionProps) {
  const [comments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!allowComments && comments.length === 0) {
    return null;
  }

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

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  } as const;

  return (
    <section className="mt-16 pt-12 border-t border-border/60 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold tracking-tight text-foreground">
              Discussion
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {comments.length} {comments.length === 1 ? "thought" : "thoughts"}{" "}
              shared
            </p>
          </div>
        </div>
      </div>

      {/* Comment List Container */}
      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-10 text-center bg-card/20 space-y-3">
          <div className="mx-auto w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground">No comments yet</p>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Be the first to share your thoughts on this article.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-border/50 bg-card/25 p-1 divide-y divide-border/30 overflow-hidden"
        >
          {comments.map((comment) => {
            const avatarStyle = getAvatarStyle(comment.name);
            const initial = comment.name.trim().charAt(0).toUpperCase();

            return (
              <motion.div
                key={comment.id}
                variants={itemVariants}
                className="p-5 space-y-3 hover:bg-card/10 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shadow-2xs bg-gradient-to-tr ${avatarStyle}`}
                  >
                    {initial}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-foreground block leading-none">
                      {comment.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed pl-11 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Submission Form Card */}
      {allowComments ? (
        <div className="rounded-2xl border border-border/50 bg-card/20 p-6 md:p-8 space-y-6">
          <div>
            <h4 className="font-bold text-sm text-foreground tracking-tight flex items-center gap-2">
              Leave a comment
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Your email address will remain private. Required fields are marked
              *
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="commenter-name"
                  className="text-xs font-semibold text-foreground/80"
                >
                  Name *
                </label>
                <input
                  id="commenter-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={submitting}
                  className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-background disabled:opacity-60"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="commenter-email"
                  className="text-xs font-semibold text-foreground/80"
                >
                  Email *
                </label>
                <input
                  id="commenter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={submitting}
                  className="h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3.5 text-xs outline-none transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-background disabled:opacity-60"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="commenter-content"
                className="text-xs font-semibold text-foreground/80"
              >
                Comment *
              </label>
              <textarea
                id="commenter-content"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What are your thoughts on this article?"
                disabled={submitting}
                className="w-full rounded-xl border border-border/60 bg-background/50 px-3.5 py-3 text-xs outline-none transition-all duration-200 placeholder:text-muted-foreground/40 focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-background resize-y min-h-[100px] disabled:opacity-60"
                required
              />
            </div>

            <AnimatePresence mode="popLayout">
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`rounded-xl border px-4 py-3 text-[11px] font-semibold overflow-hidden ${
                    message.type === "success"
                      ? "bg-green-500/10 border-green-500/25 text-green-700 dark:text-green-400"
                      : "bg-destructive/10 border-destructive/25 text-destructive"
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary pr-5 pl-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-60 transition-all duration-200 cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none shadow-sm shadow-primary/10 group"
              >
                {submitting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <PaperPlane />
                )}
                Post Comment
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card/10 p-8 text-center space-y-3">
          <div className="mx-auto w-10 h-10 rounded-xl bg-muted/65 text-muted-foreground/80 flex items-center justify-center border border-border">
            <MessageSquare size={16} className="opacity-70" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground">
              Comments are closed
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Discussion has been disabled for this article.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
