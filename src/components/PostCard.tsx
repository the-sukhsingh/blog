import { Calendar, User } from "lucide-react";
import Link from "next/link";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  author: { name: string | null };
  categories: { name: string; slug: string }[];
  tags: { name: string; slug: string }[];
}

export default function PostCard({
  title,
  slug,
  excerpt,
  coverImage,
  publishedAt,
  createdAt,
  author,
  categories,
  tags,
}: PostCardProps) {
  const date = publishedAt ?? createdAt;

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-colors duration-150 hover:border-primary/45">
      {/* Cover image */}
      {coverImage && (
        <Link
          href={`/posts/${slug}`}
          className="block overflow-hidden bg-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt={title}
            className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>
      )}

      <div className="p-5">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="mb-2 text-lg font-bold leading-snug tracking-tight">
          <Link
            href={`/posts/${slug}`}
            className="hover:text-primary transition-colors"
          >
            {title}
          </Link>
        </h2>

        {/* Excerpt */}
        {excerpt && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-t border-border/40 pt-3">
          {author.name && (
            <span className="flex items-center gap-1">
              <User size={12} />
              {author.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
