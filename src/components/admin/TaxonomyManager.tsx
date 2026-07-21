"use client";

import { Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddSquare, FolderOpen, Hashtag, TrashCan } from "@/lib/icons";

interface Taxonomy {
  id: string;
  name: string;
  slug: string;
}

interface TaxonomyManagerProps {
  initialCategories: Taxonomy[];
  initialTags: Taxonomy[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function TaxonomyManager({
  initialCategories,
  initialTags,
}: TaxonomyManagerProps) {
  const [categories, setCategories] = useState<Taxonomy[]>(initialCategories);
  const [tags, setTags] = useState<Taxonomy[]>(initialTags);

  // Categories form
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catManualSlug, setCatManualSlug] = useState(false);
  const [catCreating, setCatCreating] = useState(false);

  // Tags form
  const [tagName, setTagName] = useState("");
  const [tagSlug, setTagSlug] = useState("");
  const [tagManualSlug, setTagManualSlug] = useState(false);
  const [tagCreating, setTagCreating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-slug sync
  const handleCatNameChange = (val: string) => {
    setCatName(val);
    if (!catManualSlug) setCatSlug(slugify(val));
  };
  const handleTagNameChange = (val: string) => {
    setTagName(val);
    if (!tagManualSlug) setTagSlug(slugify(val));
  };

  const handleCreate = async (type: "category" | "tag") => {
    const name = type === "category" ? catName.trim() : tagName.trim();
    const slug = type === "category" ? catSlug.trim() : tagSlug.trim();
    if (!name || !slug) return;

    setError(null);
    if (type === "category") setCatCreating(true);
    else setTagCreating(true);

    try {
      const res = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, slug }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error ?? "Failed to create item.");
      }

      const newItem = (await res.json()) as Taxonomy;

      if (type === "category") {
        setCategories((prev) =>
          [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setCatName("");
        setCatSlug("");
        setCatManualSlug(false);
      } else {
        setTags((prev) =>
          [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setTagName("");
        setTagSlug("");
        setTagManualSlug(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setCatCreating(false);
      setTagCreating(false);
    }
  };

  const handleDelete = async (
    type: "category" | "tag",
    id: string,
    name: string,
  ) => {
    if (
      !window.confirm(
        `Delete ${type} "${name}"? Posts linked to it will not be deleted.`,
      )
    ) {
      return;
    }

    setError(null);
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/taxonomy/${type}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete taxonomy item");
      }

      if (type === "category") {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        setTags((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Categories Section */}
        <section className="rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_1px_2px_rgba(255,255,255,0.05)] px-4 py-3 md:p-5 space-y-6">
          <div className="flex items-center gap-2.5">
            <FolderOpen />
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Categories
            </h2>
            <span className="rounded-full aspect-square flex justify-center items-center bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground/95 ml-auto">
              {categories.length}
            </span>
          </div>

          {/* Add form */}
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 ">
              <div className="space-y-1.5">
                <label
                  htmlFor="cat-name-input"
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight"
                >
                  Name
                </label>
                <input
                  id="cat-name-input"
                  type="text"
                  value={catName}
                  onChange={(e) => handleCatNameChange(e.target.value)}
                  placeholder="e.g. Technology"
                  className="h-10 w-full rounded-xl border border-border/85 bg-background px-3 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5"
                />
              </div>
              <div className="space-y-1.5 relative">
                <label
                  htmlFor="cat-slug-input"
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight"
                >
                  Slug
                </label>
                {catManualSlug && (
                  <button
                    type="button"
                    onClick={() => {
                      setCatManualSlug(false);
                      setCatSlug(slugify(catName));
                    }}
                    className="text-[9px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-1 absolute top-2 right-1"
                  >
                    Reset Auto
                  </button>
                )}
                <input
                  id="cat-slug-input"
                  type="text"
                  value={catSlug}
                  onChange={(e) => {
                    setCatManualSlug(true);
                    setCatSlug(e.target.value);
                  }}
                  placeholder="technology"
                  className="h-10 w-full rounded-xl border border-border/85 bg-background px-3 font-mono text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={!catName.trim() || !catSlug.trim() || catCreating}
              onClick={() => void handleCreate("category")}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-all duration-150 cursor-pointer active:translate-y-px"
            >
              {catCreating ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <AddSquare className="**:stroke-current stroke-1.5" />
              )}
              Add Category
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border/40 pr-1">
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No categories found.
              </p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between py-3 group"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-foreground">
                      {cat.name}
                    </p>
                    <p className="truncate font-mono text-[9px] text-muted-foreground/80 mt-1">
                      /{cat.slug}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={deletingId === cat.id}
                    onClick={() =>
                      void handleDelete("category", cat.id, cat.name)
                    }
                    className="p-1.5 text-muted-foreground/80 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-all cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <TrashCan className="**:stroke-current" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Tags Section */}
        <section className="rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_1px_2px_rgba(255,255,255,0.05)] px-4 py-3 md:p-5 space-y-6">
          <div className="flex items-center gap-2.5">
            <Hashtag />
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Tags
            </h2>
            <span className="rounded-full aspect-square flex justify-center items-center bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground/95 ml-auto">
              {tags.length}
            </span>
          </div>

          {/* Add form */}
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="tag-name-input"
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight"
                >
                  Name
                </label>
                <input
                  id="tag-name-input"
                  type="text"
                  value={tagName}
                  onChange={(e) => handleTagNameChange(e.target.value)}
                  placeholder="e.g. nextjs"
                  className="h-10 w-full rounded-xl border border-border/85 bg-background px-3 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5"
                />
              </div>
              <div className="space-y-1.5 relative">
                <label
                  htmlFor="tag-slug-input"
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight"
                >
                  Slug
                </label>
                {tagManualSlug && (
                  <button
                    type="button"
                    onClick={() => {
                      setTagManualSlug(false);
                      setTagSlug(slugify(tagName));
                    }}
                    className="text-[9px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-1 absolute top-2 right-1"
                  >
                    Reset Auto
                  </button>
                )}
                <input
                  id="tag-slug-input"
                  type="text"
                  value={tagSlug}
                  onChange={(e) => {
                    setTagManualSlug(true);
                    setTagSlug(e.target.value);
                  }}
                  placeholder="nextjs"
                  className="h-10 w-full rounded-xl border border-border/85 bg-background px-3 font-mono text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={!tagName.trim() || !tagSlug.trim() || tagCreating}
              onClick={() => void handleCreate("tag")}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-all duration-150 cursor-pointer active:translate-y-px"
            >
              {tagCreating ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <AddSquare />
              )}
              Add Tag
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border/40 pr-1">
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No tags found.
              </p>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between py-3 group"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-foreground">
                      #{tag.name}
                    </p>
                    <p className="truncate font-mono text-[9px] text-muted-foreground/80 mt-1">
                      /{tag.slug}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={deletingId === tag.id}
                    onClick={() => void handleDelete("tag", tag.id, tag.name)}
                    className="p-1.5 text-muted-foreground/80 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-all cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <TrashCan className="**:stroke-current" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
