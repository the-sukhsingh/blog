import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";

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
      <div className="border-b border-border pb-8 pt-2 mb-10">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
          <span>Archives</span>
          <span>/</span>
          <span className="text-foreground">Tag</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          #{tag.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {tag.posts.length} article{tag.posts.length !== 1 ? "s" : ""} tagged
          with #{tag.name}.
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
