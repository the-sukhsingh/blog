"use client";

import { Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { PRESET_COLOR_PALETTES } from "@/lib/colorPalettes";
import { AddSquare, FolderOpen, Hashtag, TrashCan } from "@/lib/icons";

interface Category {
  id: string;
  name: string;
  slug: string;
  bgColorLight?: string | null;
  bgColorDark?: string | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TaxonomyManagerProps {
  initialCategories: Category[];
  initialTags: Tag[];
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
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [tags, setTags] = useState<Tag[]>(initialTags);

  // Categories form
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catBgLight, setCatBgLight] = useState("");
  const [catBgDark, setCatBgDark] = useState("");
  const [catManualSlug, setCatManualSlug] = useState(false);
  const [catCreating, setCatCreating] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

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
      const payload =
        type === "category"
          ? {
              type,
              name,
              slug,
              bgColorLight: catBgLight || null,
              bgColorDark: catBgDark || null,
            }
          : { type, name, slug };

      const res = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error ?? "Failed to create item.");
      }

      const newItem = await res.json();

      if (type === "category") {
        setCategories((prev) =>
          [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setCatName("");
        setCatSlug("");
        setCatBgLight("");
        setCatBgDark("");
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

  const handleUpdateCategoryBg = async (
    cat: Category,
    bgLight: string | null,
    bgDark: string | null,
  ) => {
    try {
      const res = await fetch(`/api/admin/taxonomy/category/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bgColorLight: bgLight, bgColorDark: bgDark }),
      });
      if (!res.ok) throw new Error("Failed to update category colors");
      const updated = (await res.json()) as Category;
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
      setEditingCatId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category",
      );
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

            {/* Category Default Background Colors */}
            <div className="space-y-2 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                  Category Default Background
                </span>
                {(catBgLight || catBgDark) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCatBgLight("");
                      setCatBgDark("");
                    }}
                    className="text-[9px] font-semibold text-destructive hover:underline"
                  >
                    Clear Colors
                  </button>
                )}
              </div>

              {/* Quick Palette Swatches */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {PRESET_COLOR_PALETTES.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setCatBgLight(p.light);
                      setCatBgDark(p.dark);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border/70 bg-card hover:bg-muted/50 text-[10px] transition-transform active:scale-95 cursor-pointer"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-border"
                      style={{ backgroundColor: p.light }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-border"
                      style={{ backgroundColor: p.dark }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {p.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">
                    Light Mode
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={catBgLight || "#ffffff"}
                      onChange={(e) => setCatBgLight(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5 active:scale-95 transition-transform"
                    />
                    <input
                      type="text"
                      value={catBgLight}
                      onChange={(e) => setCatBgLight(e.target.value)}
                      placeholder="#ffffff (default)"
                      className="h-8 w-full rounded-lg border border-border/85 bg-background px-2 font-mono text-[11px] outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">
                    Dark Mode
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={catBgDark || "#000000"}
                      onChange={(e) => setCatBgDark(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5 active:scale-95 transition-transform"
                    />
                    <input
                      type="text"
                      value={catBgDark}
                      onChange={(e) => setCatBgDark(e.target.value)}
                      placeholder="#121212 (default)"
                      className="h-8 w-full rounded-lg border border-border/85 bg-background px-2 font-mono text-[11px] outline-none focus:border-primary"
                    />
                  </div>
                </div>
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
                <div key={cat.id} className="py-3 space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground flex items-center gap-2">
                        <span>{cat.name}</span>
                        {(cat.bgColorLight || cat.bgColorDark) && (
                          <span className="flex items-center gap-1 text-[9px] font-normal text-muted-foreground">
                            <span
                              className="w-3 h-3 rounded-full border border-border inline-block"
                              style={{
                                backgroundColor:
                                  cat.bgColorLight || "transparent",
                              }}
                              title={`Light: ${cat.bgColorLight || "default"}`}
                            />
                            <span
                              className="w-3 h-3 rounded-full border border-border inline-block"
                              style={{
                                backgroundColor:
                                  cat.bgColorDark || "transparent",
                              }}
                              title={`Dark: ${cat.bgColorDark || "default"}`}
                            />
                          </span>
                        )}
                      </p>
                      <p className="truncate font-mono text-[9px] text-muted-foreground/80 mt-0.5">
                        /{cat.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCatId(
                            editingCatId === cat.id ? null : cat.id,
                          )
                        }
                        className="text-[10px] font-medium text-muted-foreground hover:text-foreground underline"
                      >
                        {editingCatId === cat.id ? "Close" : "Edit Colors"}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === cat.id}
                        onClick={() =>
                          void handleDelete("category", cat.id, cat.name)
                        }
                        className="p-1.5 text-muted-foreground/80 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-all cursor-pointer"
                      >
                        <TrashCan className="**:stroke-current" />
                      </button>
                    </div>
                  </div>

                  {editingCatId === cat.id && (
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                      <p className="font-semibold text-[11px]">
                        Category Default Colors
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-1">
                            Light Mode
                          </label>
                          <input
                            type="color"
                            defaultValue={cat.bgColorLight || "#ffffff"}
                            onChange={(e) =>
                              handleUpdateCategoryBg(
                                cat,
                                e.target.value,
                                cat.bgColorDark || null,
                              )
                            }
                            className="h-7 w-full rounded border border-border cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-1">
                            Dark Mode
                          </label>
                          <input
                            type="color"
                            defaultValue={cat.bgColorDark || "#000000"}
                            onChange={(e) =>
                              handleUpdateCategoryBg(
                                cat,
                                cat.bgColorLight || null,
                                e.target.value,
                              )
                            }
                            className="h-7 w-full rounded border border-border cursor-pointer"
                          />
                        </div>
                      </div>
                      {(cat.bgColorLight || cat.bgColorDark) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateCategoryBg(cat, null, null)
                          }
                          className="text-[10px] text-destructive hover:underline pt-1 block"
                        >
                          Clear Custom Colors
                        </button>
                      )}
                    </div>
                  )}
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
