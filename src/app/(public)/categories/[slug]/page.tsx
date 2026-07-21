import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} — Category`,
    description: `Browse all posts in the "${category.name}" category.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, slug: true } },
          tags: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!category) notFound();

  return (
    <div>
      <div className="border-b border-border/80 pb-10 mb-12">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 mb-3 select-none">
          <span>Archives</span>
          <span>/</span>
          <span className="text-foreground font-semibold">Category</span>
        </div>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {category.name}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {category.posts.length} article
          {category.posts.length !== 1 ? "s" : ""} filed under this category.
        </p>
      </div>

      {category.posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground bg-muted/10">
          <p className="text-base font-semibold text-foreground/80">
            No posts in this category yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/10">
          {category.posts.map((post) => (
            <PostCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              coverImage={post.coverImage}
              publishedAt={post.publishedAt}
              createdAt={post.createdAt}
              author={post.author}
              category={post.category}
              tags={post.tags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
