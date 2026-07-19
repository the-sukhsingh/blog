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
  );
}
