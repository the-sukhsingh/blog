import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comments",
};

export default function CommentsPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Comments</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Approve or delete public comments submitted on posts.
      </p>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2 border-b border-border">
        {["Pending", "Approved", "All"].map((tab) => (
          <button
            key={tab}
            type="button"
            className="border-b-2 border-transparent px-3 pb-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[active]:border-primary data-[active]:text-foreground"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">No comments to moderate.</p>
      </div>
    </div>
  );
}
