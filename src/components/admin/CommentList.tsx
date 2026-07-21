"use client";

import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrashCan } from "@/lib/icons";
import { cn } from "@/lib/utils";

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
  isPreviewMode?: boolean;
}

export function CommentCard({
  comment,
  onApprove,
  onDelete,
  processingId,
  forceState,
}: {
  comment: Comment;
  onApprove: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  processingId: string | null;
  forceState?:
    | "default"
    | "hover"
    | "focus"
    | "active"
    | "disabled"
    | "loading"
    | "error"
    | "success";
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(
    forceState === "active" || false,
  );
  const [cardError, setCardError] = useState<string | null>(
    forceState === "error"
      ? "Failed to perform action. Please try again."
      : null,
  );
  const [cardSuccess, setCardSuccess] = useState<string | null>(
    forceState === "success" ? "Action completed successfully." : null,
  );
  const [localProcessing, setLocalProcessing] = useState(
    forceState === "loading",
  );

  const isHovered = forceState === "hover";
  const isFocused = forceState === "focus";
  const isDisabled =
    forceState === "disabled" || processingId === comment.id || localProcessing;

  const handleApproveClick = async () => {
    setLocalProcessing(true);
    setCardError(null);
    setCardSuccess(null);
    const success = await onApprove(comment.id);
    setLocalProcessing(false);
    if (success) {
      setCardSuccess("Comment approved");
    } else {
      setCardError("Could not approve comment.");
    }
  };

  const handleDeleteClick = async () => {
    setIsConfirmingDelete(false);
    setLocalProcessing(true);
    setCardError(null);
    setCardSuccess(null);
    const success = await onDelete(comment.id);
    setLocalProcessing(false);
    if (success) {
      setCardSuccess("Comment deleted");
    } else {
      setCardError("Could not delete comment.");
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ type: "spring", bounce: 0, duration: 0.35 }}
      className={cn(
        "relative overflow-hidden transition-colors duration-200 text-card-foreground rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_1px_2px_rgba(255,255,255,0.05)] px-4 py-3 md:p-5 space-y-6",
        isHovered ? "border-foreground/20 bg-muted/20" : "border-border",
        isFocused && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {/* Absolute overlay for delete confirmation */}
      <AnimatePresence>
        {(isConfirmingDelete || forceState === "active") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/20 backdrop-blur-[1px] flex flex-col justify-center items-center text-center z-10 !m-0"
          >
            <p className="text-sm font-medium mb-3 text-foreground">
              Delete this comment permanently?
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isDisabled}
                className={cn(
                  "inline-flex items-center justify-center h-8 px-4 text-xs font-semibold rounded-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all cursor-pointer active:scale-95 duration-100",
                  forceState === "active" && "scale-95",
                )}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDisabled}
                className="inline-flex items-center justify-center h-8 px-4 text-xs font-semibold rounded-[10px] border border-border bg-card text-foreground hover:bg-muted transition-all cursor-pointer active:scale-95 duration-100"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meta details */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3 mb-3.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="font-semibold text-foreground text-sm">
            {comment.name}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground/80 font-mono">
            <Mail size={12} className="opacity-60" />
            {comment.email}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground/80 font-mono">
            <Calendar size={12} className="opacity-60" />
            {new Date(comment.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <span
            className={cn(
              "size-1.5 rounded-full transition-all duration-300",
              comment.approved ? "bg-green-600" : "bg-amber-500 animate-pulse",
            )}
          />
          {comment.approved ? "Approved" : "Pending"}
        </span>
      </div>

      {/* Comment Content */}
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap mb-4">
        {comment.content}
      </p>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-border/50 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FileText size={12} className="opacity-60" />
          <span>On article:</span>
          <Link
            href={`/posts/${comment.post.slug}`}
            target="_blank"
            className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-2 decoration-border hover:decoration-primary"
          >
            {comment.post.title} ↗
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!comment.approved && (
            <button
              type="button"
              disabled={isDisabled}
              onClick={handleApproveClick}
              className={cn(
                "inline-flex items-center gap-1.5 justify-center h-8 px-3.5 text-xs font-semibold rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-60 transition-all cursor-pointer duration-100 active:scale-97",
                (forceState === "active" || isFocused) &&
                  "ring-2 ring-primary ring-offset-2",
                forceState === "active" && "scale-97",
              )}
            >
              {localProcessing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Approve
            </button>
          )}
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => setIsConfirmingDelete(true)}
            className={cn(
              "inline-flex items-center gap-1.5 justify-center h-8 px-3.5 text-xs font-semibold rounded-[10px] border border-border bg-card text-foreground hover:text-destructive hover:border-destructive/30 disabled:opacity-60 transition-all cursor-pointer duration-100 active:scale-97",
              (forceState === "active" || isFocused) &&
                "ring-2 ring-primary ring-offset-2",
              forceState === "active" && "scale-97",
            )}
          >
            <TrashCan className="**:stroke-current size-3 mb-0.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Inline Feedback Messages */}
      <AnimatePresence>
        {cardError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 mt-3 pt-3 border-t border-destructive/10 text-destructive text-[11px] font-medium"
          >
            <AlertTriangle size={11} />
            {cardError}
          </motion.div>
        )}
        {cardSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 mt-3 pt-3 border-t border-green-600/10 text-green-700 text-[11px] font-medium"
          >
            <CheckCircle size={11} />
            {cardSuccess}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function CommentList({
  initialComments,
  isPreviewMode = false,
}: CommentListProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED">(
    "PENDING",
  );
  const [hoveredTab, setHoveredTab] = useState<
    "ALL" | "PENDING" | "APPROVED" | null
  >(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string): Promise<boolean> => {
    if (isPreviewMode) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, approved: true } : c)),
      );
      return true;
    }
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
      return true;
    } catch (_err) {
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    if (isPreviewMode) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setComments((prev) => prev.filter((c) => c.id !== id));
      return true;
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
      return true;
    } catch (_err) {
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  const pendingComments = comments.filter((c) => !c.approved);
  const approvedComments = comments.filter((c) => c.approved);

  const displayedComments =
    activeTab === "PENDING"
      ? pendingComments
      : activeTab === "APPROVED"
        ? approvedComments
        : comments;

  const tabsList = ["PENDING", "APPROVED", "ALL"] as const;
  const activeIndex = tabsList.indexOf(activeTab);
  const hoveredIndex = hoveredTab ? tabsList.indexOf(hoveredTab) : -1;

  let stretchX = 0;
  let scaleX = 1;

  if (hoveredIndex !== -1 && hoveredIndex !== activeIndex) {
    const distance = Math.abs(hoveredIndex - activeIndex);
    const isRight = hoveredIndex > activeIndex;
    scaleX = 1 + distance * 0.02;
    stretchX = (isRight ? 3 : -3) * distance;
  }

  return (
    <div className="space-y-6">
      {/* Segmented Control Tabs */}
      <div className="relative flex p-1 bg-muted-foreground/10 dark:bg-muted/80 shadow-[0_1px_1px_0_var(--color-muted)_inset] rounded-xl max-w-md">
        {[
          { key: "PENDING", label: "Pending", count: pendingComments.length },
          {
            key: "APPROVED",
            label: "Approved",
            count: approvedComments.length,
          },
          { key: "ALL", label: "All Comments", count: comments.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() =>
                setActiveTab(tab.key as "ALL" | "PENDING" | "APPROVED")
              }
              onMouseEnter={() => {
                setHoveredTab(tab.key as "ALL" | "PENDING" | "APPROVED");
              }}
              onMouseLeave={() => {
                setHoveredTab(null);
              }}
              className={cn(
                "relative flex-1 py-1.5 text-xs font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 rounded-lg select-none duration-100 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 z-0",
                isActive
                  ? "text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 bg-background shadow-[0_0_0_1px_var(--color-background)] rounded-lg -z-10"
                  animate={{
                    scaleX,
                    x: stretchX,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full aspect-square px-1.5 py-0.5 text-[10px] font-bold transition-colors duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/10 text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Moderation List */}
      <div className="space-y-6">
        {displayedComments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground bg-muted/10"
          >
            <MessageSquare className="mx-auto size-8 mb-3 opacity-30 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground/80">
              No comments found.
            </p>
            <p className="text-xs mt-1">
              There are no comments matching this category.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-5">
            <AnimatePresence mode="popLayout" initial={false}>
              {displayedComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                  processingId={processingId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
