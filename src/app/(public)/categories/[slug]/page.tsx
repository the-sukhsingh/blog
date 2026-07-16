import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Category: ${slug}`,
    description: `Browse all posts in the ${slug} category.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold capitalize tracking-tight">
        {slug}
      </h1>
      <p className="mb-8 text-muted-foreground">
        All posts in the &ldquo;{slug}&rdquo; category.
      </p>

      <div className="grid gap-6">
        <p className="text-muted-foreground">No posts in this category yet.</p>
      </div>
    </div>
  );
}
