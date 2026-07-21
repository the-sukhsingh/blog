import type { Metadata } from "next";
import CommentList from "@/components/admin/CommentList";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comments",
};

export default async function CommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Comments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve or delete public comments submitted on your publications.
        </p>
      </div>

      <CommentList initialComments={comments as any} />
    </div>
  );
}
