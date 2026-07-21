"use client";

/* Hallmark · component: post-editor-header · genre: editorial · theme: editorial-studio
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (46–50)
 * pre-emit critique: P5 H5 E5 S5 R5 V4
 */

import { ImageIcon, Loader2, Settings2, Undo2, X } from "lucide-react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ArticleBackgroundWrapper from "@/components/ArticleBackgroundWrapper";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArrowLeft, Setting } from "@/lib/icons";
import Tabs from "../tabs";
import TaxonomyDrawer from "./TaxonomyDrawer";

const TipTapEditor = dynamic(() => import("./TipTapEditor"), { ssr: false });

import { PRESET_COLOR_PALETTES } from "@/lib/colorPalettes";

interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  bgColorLight?: string | null;
  bgColorDark?: string | null;
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
    categoryId?: string | null;
    categoryIds?: string[];
    bgColorLight?: string | null;
    bgColorDark?: string | null;
    tagIds: string[];
    allowComments?: boolean;
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
  const [bgColorLight, setBgColorLight] = useState<string | null>(
    initialValues?.bgColorLight ?? null,
  );
  const [bgColorDark, setBgColorDark] = useState<string | null>(
    initialValues?.bgColorDark ?? null,
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialValues?.status ?? "DRAFT",
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialValues?.categoryId ?? initialValues?.categoryIds?.[0] ?? null,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialValues?.tagIds ?? [],
  );
  const [allowComments, setAllowComments] = useState(
    initialValues?.allowComments ?? true,
  );

  // Taxonomy lists
  const [categories, setCategories] = useState<Taxonomy[]>([]);
  const [tags, setTags] = useState<Taxonomy[]>([]);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // UI state
  const [previewMode, setPreviewMode] = useState<"auto" | "light" | "dark">(
    "auto",
  );
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
      setSelectedCategoryId(item.id);
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
      if (selectedCategoryId === id) setSelectedCategoryId(null);
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
      bgColorLight: bgColorLight ?? null,
      bgColorDark: bgColorDark ?? null,
      status,
      categoryId: selectedCategoryId,
      tagIds: selectedTags,
      allowComments,
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
        <div className="sticky top-0 z-40 -mt-6 -mx-6 mb-6 px-6 border-b border-border/80 bg-background/85 backdrop-blur-md h-14 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/posts")}
              className="group text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer select-none flex justify-center items-center gap-1.5 h-8 px-2 rounded-md hover:bg-muted/50 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ArrowLeft className="transition-transform duration-150 group-hover:-translate-x-0.5" />
              <span>Back to posts</span>
            </button>
            <span className="h-4 w-px bg-border/80" />
            <span className="text-xs font-semibold text-muted-foreground select-none">
              {isEditing ? "Edit Post" : "New Post"}
            </span>
            {title.trim() && (
              <>
                <span className="h-3 w-px bg-border/40 hidden md:inline" />
                <span className="text-xs text-muted-foreground max-w-[180px] lg:max-w-[280px] truncate font-medium hidden md:inline">
                  {title}
                </span>
              </>
            )}
            <span className="h-4 w-px bg-border/80" />
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                status === "PUBLISHED"
                  ? "bg-green-500/10 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground/90"
              }`}
            >
              {status === "PUBLISHED" ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card hover:bg-muted/60 h-8 px-3 text-xs font-semibold text-foreground transition-all duration-150 cursor-pointer select-none active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Setting />
              <span>Settings</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/95 disabled:opacity-50 h-8 px-3.5 text-xs font-bold text-primary-foreground transition-all duration-150 cursor-pointer select-none active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              <span>
                {saving ? "Saving…" : isEditing ? "Save Changes" : "Publish"}
              </span>
            </button>
          </div>
        </div>

        {/* Center Writing Canvas with Theme-Aware Live Background Preview */}
        {(() => {
          const selectedCat = categories.find(
            (c) => c.id === selectedCategoryId,
          );
          const activeLight = bgColorLight ?? selectedCat?.bgColorLight ?? null;
          const activeDark = bgColorDark ?? selectedCat?.bgColorDark ?? null;
          const hasBackground = Boolean(activeLight || activeDark);

          // Custom forced preview style if user manually picked Light or Dark mode preview
          let inlineCanvasStyle: React.CSSProperties = {};
          if (previewMode === "light" && activeLight) {
            inlineCanvasStyle = {
              backgroundColor: activeLight,
              color: "#18181b",
            };
          } else if (previewMode === "dark" && activeDark) {
            inlineCanvasStyle = {
              backgroundColor: activeDark,
              color: "#f4f4f5",
            };
          }

          return (
            <ArticleBackgroundWrapper
              bgColorLight={previewMode === "auto" ? activeLight : null}
              bgColorDark={previewMode === "auto" ? activeDark : null}
              className="max-w-4xl mx-auto space-y-6 p-6 md:p-8 rounded-3xl relative border border-transparent shadow-xs transition-all duration-300"
            >
              <div
                style={inlineCanvasStyle}
                className="space-y-6 rounded-2xl p-2 transition-colors duration-200"
              >
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
            </ArticleBackgroundWrapper>
          );
        })()}

        {/* Slide-over Publish Settings Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-md overflow-y-auto p-4 border-l border-border/80 bg-background scrollbar-none "
          >
            <SheetHeader className="p-2">
              <SheetTitle className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                Publish Settings
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground/90 mt-1 leading-normal">
                Configure taxonomies, cover photos, and details for this
                article.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              {/* Status Option */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground select-none">
                  Post status
                </label>
                <Tabs
                  tabs={[
                    { id: "DRAFT", label: "Draft" },
                    { id: "PUBLISHED", label: "Published" },
                  ]}
                  activeTab={status}
                  setActiveTab={(id) => setStatus(id as "DRAFT" | "PUBLISHED")}
                  className="w-full"
                />
              </div>

              {/* Allow Comments Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50">
                <div className="space-y-0.5 pr-2">
                  <label
                    htmlFor="allow-comments"
                    className="text-xs font-bold text-foreground cursor-pointer select-none"
                  >
                    Allow comments
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Let readers share their thoughts and comment on this
                    article.
                  </p>
                </div>
                <Checkbox
                  id="allow-comments"
                  checked={allowComments}
                  onCheckedChange={(checked) => setAllowComments(!!checked)}
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground select-none">
                  Cover image
                </label>
                {coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-muted/20 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-full object-cover max-h-[160px] transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="absolute right-2 top-2 rounded-lg bg-background/90 p-1.5 text-muted-foreground hover:text-destructive hover:bg-background border border-border shadow-sm transition-all active:scale-95 aspect-square"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="cover-upload"
                    className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/80 bg-muted/10 text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:bg-muted/20 active:scale-[0.98] select-none"
                  >
                    {uploadingCover ? (
                      <Loader2
                        size={18}
                        className="animate-spin text-muted-foreground"
                      />
                    ) : (
                      <>
                        <ImageIcon
                          size={16}
                          className="opacity-70 text-foreground/80"
                        />
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
              <div className="space-y-2">
                <label
                  htmlFor="post-excerpt"
                  className="block text-xs font-semibold text-foreground select-none"
                >
                  Excerpt summary
                </label>
                <textarea
                  id="post-excerpt"
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A short summary for search engines…"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-foreground focus:ring-1 focus:ring-foreground/20 resize-none min-h-[70px]"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label
                  htmlFor="post-slug"
                  className="block text-xs font-semibold text-foreground select-none"
                >
                  URL Slug path
                </label>
                <div className="relative flex items-center">
                  <input
                    id="post-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="post-slug"
                    className="h-9 w-full rounded-lg border border-border bg-background pl-3 pr-14 font-mono text-xs text-foreground outline-none transition-all focus:border-foreground focus:ring-1 focus:ring-foreground/20"
                  />
                  {slugManuallyEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlugManuallyEdited(false);
                        setSlug(slugify(title));
                      }}
                      className="absolute right-2.5 text-[10px] font-bold text-muted-foreground hover:text-foreground underline select-none cursor-pointer active:scale-95"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Category (Single selection) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <span className="text-xs font-semibold text-foreground">
                    Category (Select one)
                  </span>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
                {categories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No categories yet.
                  </p>
                ) : (
                  <div className="max-h-36 space-y-1 overflow-y-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(null)}
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between ${
                        selectedCategoryId === null
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                          : "text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span>No Category</span>
                    </button>
                    {categories.map((cat) => {
                      const isSelected = selectedCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "text-foreground/80 hover:bg-muted/50 hover:text-foreground border border-transparent"
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {cat.bgColorLight && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-border inline-block"
                              style={{ backgroundColor: cat.bgColorLight }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Article Background Customization (Light & Dark Mode) */}
              <div className="space-y-4 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Article Background
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Overrides category & global theme background
                    </span>
                  </div>
                  {(bgColorLight || bgColorDark) && (
                    <button
                      type="button"
                      onClick={() => {
                        setBgColorLight(null);
                        setBgColorDark(null);
                      }}
                      className="text-[10px] font-semibold text-destructive hover:underline cursor-pointer active:scale-95 transition-transform"
                    >
                      Clear Override
                    </button>
                  )}
                </div>

                {/* Preset Palettes Grid */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    Curated Palettes
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_COLOR_PALETTES.map((p) => {
                      const isActive =
                        bgColorLight === p.light && bgColorDark === p.dark;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setBgColorLight(p.light);
                            setBgColorDark(p.dark);
                          }}
                          className={`group flex items-center justify-between p-2 rounded-xl border text-[11px] transition-all duration-150 cursor-pointer active:scale-[0.97] ${
                            isActive
                              ? "border-primary bg-primary/10 font-bold text-foreground ring-2 ring-primary/30 shadow-xs"
                              : "border-border/80 hover:border-foreground/30 text-muted-foreground bg-card hover:bg-muted/30"
                          }`}
                        >
                          <span className="truncate text-[10px] font-medium">
                            {p.name}
                          </span>
                          <span className="flex items-center gap-1 shrink-0 ml-1.5 p-0.5 rounded-full bg-muted/60">
                            <span
                              className="w-3 h-3 rounded-full border border-border shadow-2xs"
                              style={{ backgroundColor: p.light }}
                              title={`Light: ${p.light}`}
                            />
                            <span
                              className="w-3 h-3 rounded-full border border-border shadow-2xs"
                              style={{ backgroundColor: p.dark }}
                              title={`Dark: ${p.dark}`}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Independent Custom Color Selection */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    Custom Independent Selection
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1.5 p-2.5 rounded-xl border border-border/80 bg-card">
                      <label className="text-[10px] font-semibold text-foreground/90 block">
                        Light Mode
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColorLight || "#ffffff"}
                          onChange={(e) => setBgColorLight(e.target.value)}
                          className="h-7 w-8 cursor-pointer rounded-lg border border-border bg-transparent p-0.5 transition-transform active:scale-95"
                        />
                        <input
                          type="text"
                          value={bgColorLight || ""}
                          onChange={(e) =>
                            setBgColorLight(e.target.value || null)
                          }
                          placeholder="Default"
                          className="h-7 w-full rounded-md border border-border bg-background px-2 text-[10px] font-mono outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 p-2.5 rounded-xl border border-border/80 bg-card">
                      <label className="text-[10px] font-semibold text-foreground/90 block">
                        Dark Mode
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColorDark || "#000000"}
                          onChange={(e) => setBgColorDark(e.target.value)}
                          className="h-7 w-8 cursor-pointer rounded-lg border border-border bg-transparent p-0.5 transition-transform active:scale-95"
                        />
                        <input
                          type="text"
                          value={bgColorDark || ""}
                          onChange={(e) =>
                            setBgColorDark(e.target.value || null)
                          }
                          placeholder="Default"
                          className="h-7 w-full rounded-md border border-border bg-background px-2 text-[10px] font-mono outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <span className="text-xs font-semibold text-foreground">
                    Tags
                  </span>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
                {tags.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tags yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground font-semibold"
                              : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          }`}
                        >
                          # {tag.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation CTA inside the sheet */}
            <div className="pt-4 border-t border-border/80">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="w-full rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground h-9 text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </form>
    </>
  );
}
