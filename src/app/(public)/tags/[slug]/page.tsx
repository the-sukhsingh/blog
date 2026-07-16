import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Tag: ${slug}`,
    description: `Browse all posts tagged with ${slug}.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold capitalize tracking-tight">
        #{slug}
      </h1>
      <p className="mb-8 text-muted-foreground">
        All posts tagged with &ldquo;{slug}&rdquo;.
      </p>

      <div className="grid gap-6">
        <p className="text-muted-foreground">No posts with this tag yet.</p>
      </div>
    </div>
  );
}
