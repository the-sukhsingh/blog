"use client";

import { useState } from "react";
import { Plus, Tag, FolderOpen, Loader2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface Taxonomy {
  id: string;
  name: string;
  slug: string;
}

interface TaxonomyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a new category/tag is created so PostForm can refresh its list */
  onCreated: (type: "category" | "tag", item: Taxonomy) => void;
  /** Called when an item is deleted */
  onDeleted: (type: "category" | "tag", id: string) => void;
  categories: Taxonomy[];
  tags: Taxonomy[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Toast = { id: number; type: "success" | "error"; message: string };

export default function TaxonomyDrawer({
  open,
  onOpenChange,
  onCreated,
  onDeleted,
  categories,
  tags,
}: TaxonomyDrawerProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "tags">("categories");

  // Create form state
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastId = 0;

  const addToast = (type: "success" | "error", message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // Name → slug auto-sync
  const handleNameChange = (val: string) => {
    setNewName(val);
    if (!slugManual) setNewSlug(slugify(val));
  };

  const handleSlugChange = (val: string) => {
    setNewSlug(val);
    setSlugManual(true);
  };

  const resetForm = () => {
    setNewName("");
    setNewSlug("");
    setSlugManual(false);
  };

  // Create category or tag
  const handleCreate = async () => {
    const name = newName.trim();
    const slug = newSlug.trim();
    if (!name || !slug) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab === "categories" ? "category" : "tag", name, slug }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to create.");
      }

      const item = await res.json() as Taxonomy;
      onCreated(activeTab === "categories" ? "category" : "tag", item);
      addToast("success", `"${item.name}" created!`);
      resetForm();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  // Delete category or tag
  const handleDelete = async (type: "category" | "tag", id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? Posts using it won't be affected.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/taxonomy/${type}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete.");
      onDeleted(type, id);
      addToast("success", `"${name}" deleted.`);
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const items = activeTab === "categories" ? categories : tags;
  const itemType = activeTab === "categories" ? "category" : "tag";

  return (
    <>
      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg pointer-events-auto transition-all animate-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "bg-green-600 text-white dark:bg-green-700"
                : "bg-destructive text-destructive-foreground"
            }`}
          >
            {t.type === "success" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {t.message}
          </div>
        ))}
      </div>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col overflow-hidden p-0">
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FolderOpen size={15} />
              </span>
              Manage Taxonomy
            </SheetTitle>
            <SheetDescription>
              Create and manage categories &amp; tags without leaving the editor.
            </SheetDescription>
          </SheetHeader>

          <Separator />

          {/* Tabs */}
          <div className="flex gap-1 px-5 py-3">
            {(["categories", "tags"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); resetForm(); }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {tab === "categories" ? <FolderOpen size={13} /> : <Tag size={13} />}
                {tab === "categories" ? "Categories" : "Tags"}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  activeTab === tab
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {tab === "categories" ? categories.length : tags.length}
                </span>
              </button>
            ))}
          </div>

          <Separator />

          {/* Create form */}
          <div className="px-5 py-4 space-y-3 bg-muted/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New {activeTab === "categories" ? "Category" : "Tag"}
            </p>
            <div className="space-y-2">
              <div>
                <Label htmlFor="tax-name" className="text-xs">Name</Label>
                <Input
                  id="tax-name"
                  value={newName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={activeTab === "categories" ? "e.g. Web Development" : "e.g. nextjs"}
                  className="mt-1 h-9 text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleCreate(); } }}
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tax-slug" className="text-xs">Slug</Label>
                  {slugManual && (
                    <button
                      type="button"
                      onClick={() => { setSlugManual(false); setNewSlug(slugify(newName)); }}
                      className="text-[10px] text-muted-foreground underline hover:text-foreground"
                    >
                      Auto
                    </button>
                  )}
                </div>
                <Input
                  id="tax-slug"
                  value={newSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="e.g. web-development"
                  className="mt-1 h-9 font-mono text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleCreate(); } }}
                />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="w-full gap-1.5"
              disabled={!newName.trim() || !newSlug.trim() || creating}
              onClick={() => void handleCreate()}
            >
              {creating ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Plus size={13} />
              )}
              {creating ? "Creating…" : `Add ${activeTab === "categories" ? "Category" : "Tag"}`}
            </Button>
          </div>

          <Separator />

          {/* Existing items list */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                {activeTab === "categories" ? (
                  <FolderOpen size={32} className="mb-3 opacity-30" />
                ) : (
                  <Tag size={32} className="mb-3 opacity-30" />
                )}
                <p className="text-sm">No {activeTab} yet.</p>
                <p className="mt-1 text-xs">Use the form above to create one.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 group hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">/{item.slug}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">
                        {activeTab === "categories" ? "category" : "tag"}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                        disabled={deletingId === item.id}
                        onClick={() => void handleDelete(itemType, item.id, item.name)}
                      >
                        {deletingId === item.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
