import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug,
    description: `Read the article: ${slug}`,
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>{slug}</h1>
      <p className="text-muted-foreground">Post content will appear here.</p>
    </article>
  );
}
