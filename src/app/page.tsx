import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home — Blog",
  description: "Browse our latest articles, stories, and guides.",
};

export default function HomePage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Latest Posts</h1>
      <p className="mb-8 text-muted-foreground">
        Browse our latest articles, stories, and guides.
      </p>

      {/* Post list will be fetched and rendered here */}
      <div className="grid gap-6">
        <p className="text-muted-foreground">No posts yet.</p>
      </div>
    </div>
  );
}

