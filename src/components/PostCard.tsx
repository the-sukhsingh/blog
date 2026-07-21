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
  category?: { name: string; slug: string } | null;
  categories?: { name: string; slug: string }[];
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
  category,
  categories,
  tags,
}: PostCardProps) {
  const date = publishedAt ?? createdAt;
  const activeCategory =
    category ?? (categories && categories.length > 0 ? categories[0] : null);

  return (
    <article className="group grid grid-cols-1 md:grid-cols-4 gap-6 py-8 border-b border-border/40 last:border-b-0 items-start transition-colors duration-150">
      <div className="md:col-span-3 space-y-3">
        {/* Category */}
        {activeCategory && (
          <div className="flex flex-wrap gap-1.5">
            <Link
              key={activeCategory.slug}
              href={`/categories/${activeCategory.slug}`}
              className="rounded-full bg-muted/95 hover:bg-primary hover:text-primary-foreground px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/90 transition-all duration-200"
            >
              {activeCategory.name}
            </Link>
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
          <Link href={`/posts/${slug}`}>{title}</Link>
        </h2>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-muted-foreground/95 leading-relaxed line-clamp-2 max-w-2xl">
            {excerpt}
          </p>
        )}

        {/* Meta & Tags */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[11px] text-muted-foreground/80 select-none">
          <span className="font-semibold text-foreground/85">
            By {author.name ?? "Staff Writer"}
          </span>
          <span className="h-3 w-px bg-border/80" />
          <span className="font-mono">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {tags.length > 0 && (
            <>
              <span className="h-3 w-px bg-border/80" />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image */}
      {coverImage && (
        <div className="md:col-span-1 order-first md:order-last">
          <Link
            href={`/posts/${slug}`}
            className="block overflow-hidden rounded-xl bg-muted/30 aspect-[16/10] border border-border/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            />
          </Link>
        </div>
      )}
    </article>
  );
}
