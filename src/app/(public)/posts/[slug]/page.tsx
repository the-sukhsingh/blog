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
    <div className="mx-auto max-w-3xl py-4 md:py-8">
      {/* Back link */}
      <Link
        href="/"
        className="group mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground transition-colors"
      >
        <ArrowLeft
          size={13}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to articles
      </Link>

      {/* Categories */}
      {post.categories.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {post.categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="rounded-full bg-muted/95 hover:bg-primary hover:text-primary-foreground px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="mb-6 font-heading text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
        {post.title}
      </h1>

      {/* Meta */}
      <div className="mb-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-y border-border/40 py-4">
        {post.author.name && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground/90">
              By {post.author.name}
            </span>
          </div>
        )}
        <span className="h-3 w-px bg-border/80 hidden sm:block" />
        <span className="flex items-center gap-1.5 font-mono">
          <Calendar size={13} />
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
        <div className="mb-10 overflow-hidden rounded-2xl border border-border/80 shadow-md shadow-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full object-cover max-h-[450px]"
          />
        </div>
      )}

      {/* Content */}
      <article
        className="typeset"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: generateHtmlFromJSON(post.content) }}
      />
      {/* <div className="typeset max-w-[42em]">
        {generateHtmlFromJSON(post.content)}
      </div> */}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-2 border-t border-border/60 pt-8">
          {post.tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="rounded-lg border border-border/85 px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-all duration-150"
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
