import type { Metadata } from "next";
import PostForm from "@/components/editor/PostForm";

export const metadata: Metadata = {
  title: "New Post",
};

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Create New Post</h1>
      <PostForm />
    </div>
  );
}
