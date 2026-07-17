import { ArrowLeft, Calendar, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import { generateHtmlFromJSON } from "@/lib/editor";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, excerpt: true, coverImage: true },
  });

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      categories: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
      comments: {
        where: { approved: true },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!post) notFound();

  const date = post.publishedAt ?? post.createdAt;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back link */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Back to posts
      </Link>

      {/* Categories */}
      {post.categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {post.categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>

      {/* Meta */}
      <div className="mb-8 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground border-b border-border/40 pb-4">
        {post.author.name && (
          <span className="flex items-center gap-1.5">
            <User size={12} />
            {post.author.name}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar size={12} />
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          className="mb-8 w-full rounded-xl object-cover border border-border"
          style={{ maxHeight: 400 }}
        />
      )}

      {/* Content */}
      <article
        className="prose prose-neutral dark:prose-invert max-w-none"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: generateHtmlFromJSON(post.content) }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-1.5 border-t border-border pt-6">
          {post.tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Dynamic Discussion/Comments */}
      <CommentSection postId={post.id} initialComments={post.comments} />
    </div>
  );
}
