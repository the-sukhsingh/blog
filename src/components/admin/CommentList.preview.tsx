"use client";

import { CommentCard } from "./CommentList";

const mockCommentBase = {
  name: "Marcus Aurelius",
  email: "marcus@meditations.org",
  content:
    "Very thoughtful analysis on contemporary publishing systems. The alignment of structural details and flat panels feels incredibly polished and intentional.",
  createdAt: new Date("2026-07-20T12:00:00Z").toISOString(),
  post: { title: "The Art of Slow Software", slug: "slow-software" },
};

const statesList = [
  {
    state: "default" as const,
    label: "default (pending approval)",
    comment: { ...mockCommentBase, id: "c-default", approved: false },
  },
  {
    state: "hover" as const,
    label: "hover (card hover border and button overlays)",
    comment: { ...mockCommentBase, id: "c-hover", approved: false },
  },
  {
    state: "focus" as const,
    label: "focus (focus-visible focus ring layout)",
    comment: { ...mockCommentBase, id: "c-focus", approved: false },
  },
  {
    state: "active" as const,
    label: "active (pressed down scale state and overlay confirmation)",
    comment: { ...mockCommentBase, id: "c-active", approved: false },
  },
  {
    state: "disabled" as const,
    label: "disabled (action buttons blocked)",
    comment: { ...mockCommentBase, id: "c-disabled", approved: false },
  },
  {
    state: "loading" as const,
    label: "loading (processing spinner inside button)",
    comment: { ...mockCommentBase, id: "c-loading", approved: false },
  },
  {
    state: "error" as const,
    label: "error (inline warning banner inside card)",
    comment: { ...mockCommentBase, id: "c-error", approved: false },
  },
  {
    state: "success" as const,
    label: "success (inline confirmation banner inside card)",
    comment: { ...mockCommentBase, id: "c-success", approved: false },
  },
];

export default function CommentListPreview() {
  const dummyHandler = async () => {
    return new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(true), 1000),
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-12 bg-background text-foreground">
      <header className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          CommentCard — 8 States
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Interactive and simulated state preview of the redesigned admin
          comment list item.
        </p>
      </header>

      <div className="space-y-8">
        {statesList.map(({ state, label, comment }) => (
          <div key={state} className="space-y-2">
            <span className="font-mono text-xs text-muted-foreground/80 block uppercase tracking-wider">
              {label}
            </span>
            <CommentCard
              comment={comment}
              onApprove={dummyHandler}
              onDelete={dummyHandler}
              processingId={null}
              forceState={state}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
