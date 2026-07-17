import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostForm from "@/components/editor/PostForm";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: post ? `Edit — ${post.title}` : "Edit Post" };
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      categories: { select: { id: true } },
      tags: { select: { id: true } },
    },
  });

  if (!post) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {post.status}
        </span>
      </div>

      <PostForm
        postId={post.id}
        initialValues={{
          title: post.title,
          slug: post.slug,
          content: post.content as any,
          excerpt: post.excerpt ?? "",
          coverImage: post.coverImage ?? null,
          status: post.status,
          categoryIds: post.categories.map((c) => c.id),
          tagIds: post.tags.map((t) => t.id),
        }}
      />
    </div>
  );
}
