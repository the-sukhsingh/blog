import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!tag) return { title: "Tag Not Found" };
  return {
    title: `#${tag.name} — Tag`,
    description: `Browse all posts tagged with "${tag.name}".`,
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true } },
          categories: { select: { name: true, slug: true } },
          tags: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!tag) notFound();

  return (
    <div>
      <div className="mb-10">
        <p className="mb-1 text-sm font-medium text-primary uppercase tracking-wider">
          Tag
        </p>
        <h1 className="mb-2 text-4xl font-bold tracking-tight">
          #{tag.name}
        </h1>
        <p className="text-muted-foreground">
          {tag.posts.length} post{tag.posts.length !== 1 ? "s" : ""} with this tag
        </p>
      </div>

      {tag.posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">No posts with this tag yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tag.posts.map((post) => (
            <PostCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              coverImage={post.coverImage}
              publishedAt={post.publishedAt}
              createdAt={post.createdAt}
              author={post.author}
              categories={post.categories}
              tags={post.tags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
