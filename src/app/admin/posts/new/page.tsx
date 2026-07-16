import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Post",
};

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Create New Post
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
              placeholder="My awesome article"
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
              placeholder="my-awesome-article"
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
              placeholder="A short summary for search engines and listing pages…"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          {/* Publish card */}
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
            <button
              type="button"
              className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Save Post
            </button>
          </div>

          {/* Cover image */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Cover Image</h2>
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
              Click to upload
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Categories</h2>
            <p className="text-xs text-muted-foreground">
              No categories available.
            </p>
          </div>

          {/* Tags */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Tags</h2>
            <p className="text-xs text-muted-foreground">No tags available.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
