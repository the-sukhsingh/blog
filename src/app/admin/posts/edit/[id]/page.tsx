import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit Post — ${id}` };
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Edit Post{" "}
        <span className="font-mono text-base text-muted-foreground">#{id}</span>
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Main editor area */}
        <div className="col-span-2 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Post title"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="slug" className="text-sm font-medium">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              placeholder="post-slug"
              className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Content</label>
            <div className="min-h-96 rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
              Rich text editor (Tiptap) will be rendered here.
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="excerpt" className="text-sm font-medium">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              rows={3}
              placeholder="Post excerpt…"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Publish</h2>
            <div className="mb-3 space-y-1.5">
              <label htmlFor="status" className="text-xs text-muted-foreground">
                Status
              </label>
              <select
                id="status"
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Update
              </button>
              <button
                type="button"
                className="rounded-md border border-destructive px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Cover Image</h2>
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
              Click to replace
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Categories</h2>
            <p className="text-xs text-muted-foreground">
              No categories available.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Tags</h2>
            <p className="text-xs text-muted-foreground">No tags available.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
