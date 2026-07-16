import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taxonomy",
};

export default function TaxonomyPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Taxonomy</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Manage categories and tags for your posts.
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Categories */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Categories</h2>
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              + Add
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            No categories yet.
          </p>
        </section>

        {/* Tags */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Tags</h2>
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              + Add
            </button>
          </div>
          <p className="text-xs text-muted-foreground">No tags yet.</p>
        </section>
      </div>
    </div>
  );
}
