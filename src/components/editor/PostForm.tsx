"use client";

import { ImageIcon, Loader2, Settings2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TaxonomyDrawer from "./TaxonomyDrawer";

const TipTapEditor = dynamic(() => import("./TipTapEditor"), { ssr: false });

interface Taxonomy {
  id: string;
  name: string;
  slug: string;
}

interface PostFormProps {
  postId?: string;
  initialValues?: {
    title: string;
    slug: string;
    content: any;
    excerpt: string;
    coverImage: string | null;
    status: "DRAFT" | "PUBLISHED";
    categoryIds: string[];
    tagIds: string[];
  };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PostForm({ postId, initialValues }: PostFormProps) {
  const router = useRouter();
  const isEditing = Boolean(postId);

  // Form state
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [content, setContent] = useState<any>(initialValues?.content ?? null);
  const [excerpt, setExcerpt] = useState(initialValues?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(
    initialValues?.coverImage ?? null,
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialValues?.status ?? "DRAFT",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialValues?.categoryIds ?? [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialValues?.tagIds ?? [],
  );

  // Taxonomy lists
  const [categories, setCategories] = useState<Taxonomy[]>([]);
  const [tags, setTags] = useState<Taxonomy[]>([]);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
  const [uploadingCover, setUploadingCover] = useState(false);

  const slugDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load taxonomy on mount
  useEffect(() => {
    fetch("/api/admin/taxonomy")
      .then((r) => r.json())
      .then((data: { categories: Taxonomy[]; tags: Taxonomy[] }) => {
        setCategories(data.categories ?? []);
        setTags(data.tags ?? []);
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  // Auto-slug from title
  useEffect(() => {
    if (slugManuallyEdited) return;
    if (slugDebounce.current) clearTimeout(slugDebounce.current);
    slugDebounce.current = setTimeout(() => {
      setSlug(slugify(title));
    }, 300);
  }, [title, slugManuallyEdited]);

  // ── Drawer callbacks ────────────────────────────────────────────────────

  const handleTaxonomyCreated = (type: "category" | "tag", item: Taxonomy) => {
    if (type === "category") {
      setCategories((prev) =>
        [...prev, item].sort((a, b) => a.name.localeCompare(b.name)),
      );
      // Auto-select the newly created category
      setSelectedCategories((prev) => [...prev, item.id]);
    } else {
      setTags((prev) =>
        [...prev, item].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSelectedTags((prev) => [...prev, item.id]);
    }
  };

  const handleTaxonomyDeleted = (type: "category" | "tag", id: string) => {
    if (type === "category") {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSelectedCategories((prev) => prev.filter((cid) => cid !== id));
    } else {
      setTags((prev) => prev.filter((t) => t.id !== id));
      setSelectedTags((prev) => prev.filter((tid) => tid !== id));
    }
  };

  // ── Cover upload ────────────────────────────────────────────────────────

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        setCoverImage(data.url);
      } else {
        setCoverImage(URL.createObjectURL(file));
      }
    } catch {
      setCoverImage(URL.createObjectURL(file));
    } finally {
      setUploadingCover(false);
    }
  };

  // ── Toggle selection ────────────────────────────────────────────────────

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim(),
      coverImage: coverImage ?? null,
      status,
      categoryIds: selectedCategories,
      tagIds: selectedTags,
    };

    try {
      const url = isEditing ? `/api/admin/posts/${postId}` : "/api/admin/posts";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to save post.");
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Taxonomy Drawer */}
      <TaxonomyDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCreated={handleTaxonomyCreated}
        onDeleted={handleTaxonomyDeleted}
        categories={categories}
        tags={tags}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-6">
          {/* ── Main editor area ── */}
          <div className="col-span-2 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="post-title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                id="post-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My awesome article"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label htmlFor="post-slug" className="text-sm font-medium">
                Slug <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="post-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="my-awesome-article"
                  className="h-10 flex-1 rounded-md border border-border bg-background px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
                {slugManuallyEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlugManuallyEdited(false);
                      setSlug(slugify(title));
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                URL: <span className="font-mono">/posts/{slug || "…"}</span>
              </p>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Content</label>
              <TipTapEditor
                content={content}
                onChange={(json) => setContent(json)}
                placeholder="Start writing your article…"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label htmlFor="post-excerpt" className="text-sm font-medium">
                Excerpt
              </label>
              <textarea
                id="post-excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A short summary for search engines and listing pages…"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Publish */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">Publish</h2>
              <div className="mb-3 space-y-1.5">
                <label
                  htmlFor="post-status"
                  className="text-xs text-muted-foreground"
                >
                  Status
                </label>
                <select
                  id="post-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "DRAFT" | "PUBLISHED")
                  }
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving…" : isEditing ? "Update Post" : "Save Post"}
              </button>
            </div>

            {/* Cover image */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">Cover Image</h2>
              {coverImage ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full rounded-md object-cover"
                    style={{ maxHeight: 160 }}
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="cover-upload"
                  className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {uploadingCover ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <ImageIcon size={20} />
                      <span>Click to upload</span>
                    </>
                  )}
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>
              )}
            </div>

            {/* Categories */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Categories</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title="Manage categories & tags"
                >
                  <Settings2 size={12} />
                  Manage
                </button>
              </div>
              {categories.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    No categories yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="mt-1 text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Create one →
                  </button>
                </div>
              ) : (
                <div className="max-h-44 space-y-1.5 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      htmlFor={`cat-${cat.id}`}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
                    >
                      <input
                        id={`cat-${cat.id}`}
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="h-3.5 w-3.5 rounded border-border accent-primary"
                      />
                      <span className="flex-1 truncate">{cat.name}</span>
                      {selectedCategories.includes(cat.id) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Tags</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title="Manage categories & tags"
                >
                  <Settings2 size={12} />
                  Manage
                </button>
              </div>
              {tags.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">No tags yet.</p>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="mt-1 text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Create one →
                  </button>
                </div>
              ) : (
                <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
