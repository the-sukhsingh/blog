/**
 * NOTE: This file intentionally does not define a home page.
 * The home route `/` is defined at `app/page.tsx`.
 *
 * This file exists only as a placeholder to avoid confusion.
 * Next.js will throw a build error if both `app/page.tsx` and
 * `app/(public)/page.tsx` exist simultaneously because they resolve
 * to the same URL `/`. If you see a build error, delete this file.
 */
import { notFound } from "next/navigation";

export default function PublicHomePlaceholder() {
  notFound();
}

