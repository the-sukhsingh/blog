"use client";

import { ImageIcon, Loader2, Settings2, Undo2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TaxonomyDrawer from "./TaxonomyDrawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
  const [sheetOpen, setSheetOpen] = useState(false);

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
        {/* Floating Write Header */}

        <div className="sticky top-0 inset-x-0 w-full z-50 flex items-center justify-between backdrop-blur-md py-4 px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/posts")}
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
            >
              <Undo2 /> Back to posts
            </button>
            <span className="h-4 w-px bg-border/80" />
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/95 select-none">
              {status === "PUBLISHED" ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="rounded-xl border border-border/85 bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted/70 transition-all cursor-pointer"
            >
              Publish Settings
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-60 transition-all duration-150 cursor-pointer active:translate-y-px"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Saving…" : isEditing ? "Save Changes" : "Publish Post"}
            </button>
          </div>
        </div>

        {/* Center Writing Canvas */}
        <div className="max-w-3xl mx-auto space-y-6 px-4 pt-4">
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-4xl md:text-5xl font-black tracking-tight placeholder:opacity-30 outline-none border-none bg-transparent focus:ring-0 text-foreground py-2"
            required
          />

          <div className="min-h-[500px]">
            <TipTapEditor
              content={content}
              onChange={(json) => setContent(json)}
              placeholder="Tell your story..."
            />
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Slide-over Publish Settings Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6"
          >
            <SheetHeader className="pb-4 border-b border-border/60">
              <SheetTitle className="text-base font-bold flex items-center gap-2">
                Publish Settings
              </SheetTitle>
              <SheetDescription>
                Configure taxonomies, cover photos, and details for this
                article.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 pt-2">
              {/* Status Option */}
              <div className="space-y-1.5">
                <label
                  htmlFor="post-status"
                  className="text-xs font-bold text-foreground/80 uppercase tracking-wider"
                >
                  Post Status
                </label>
                <select
                  id="post-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "DRAFT" | "PUBLISHED")
                  }
                  className="h-10 w-full rounded-xl border border-border/85 bg-background px-3 text-xs font-semibold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              {/* Cover Image */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                  Cover Image
                </label>
                {coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-muted/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-full object-cover max-h-[160px]"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="absolute right-2 top-2 rounded-lg bg-background/90 p-1.5 text-muted-foreground hover:text-destructive hover:bg-background border border-border shadow-sm transition-all"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="cover-upload"
                    className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/85 bg-muted/10 text-xs text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-muted/20"
                  >
                    {uploadingCover ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <ImageIcon size={18} className="opacity-75" />
                        <span className="font-semibold">
                          Click to upload image
                        </span>
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

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label
                  htmlFor="post-excerpt"
                  className="text-xs font-bold text-foreground/80 uppercase tracking-wider"
                >
                  Excerpt Summary
                </label>
                <textarea
                  id="post-excerpt"
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A short summary for search engines…"
                  className="w-full rounded-xl border border-border/85 bg-background px-3 py-2 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5 resize-none min-h-[70px]"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label
                  htmlFor="post-slug"
                  className="text-xs font-bold text-foreground/80 uppercase tracking-wider"
                >
                  URL Slug path
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
                    placeholder="post-slug"
                    className="h-10 flex-1 rounded-xl border border-border/85 bg-background px-3 font-mono text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5"
                  />
                  {slugManuallyEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlugManuallyEdited(false);
                        setSlug(slugify(title));
                      }}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                  <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                    Categories
                  </span>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
                {categories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No categories yet.
                  </p>
                ) : (
                  <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        htmlFor={`cat-${cat.id}`}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-muted/65"
                      >
                        <input
                          id={`cat-${cat.id}`}
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="h-3.5 w-3.5 rounded border-border accent-primary"
                        />
                        <span className="flex-1 truncate text-foreground/80">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                  <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                    Tags
                  </span>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
                {tags.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tags yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                          selectedTags.includes(tag.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/85 bg-background text-muted-foreground hover:border-primary hover:text-primary"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation CTA inside the sheet */}
            <div className="pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer text-center"
              >
                Close Settings
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </form>
    </>
  );
}
