import type { Metadata } from "next";
import TaxonomyManager from "@/components/admin/TaxonomyManager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Taxonomy",
};

export default async function TaxonomyPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Taxonomy
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage categories and tags to organize your articles.
        </p>
      </div>

      <TaxonomyManager initialCategories={categories} initialTags={tags} />
    </div>
  );
}
