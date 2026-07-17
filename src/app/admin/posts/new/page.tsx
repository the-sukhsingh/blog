import type { Metadata } from "next";
import PostForm from "@/components/editor/PostForm";

export const metadata: Metadata = {
  title: "New Post",
};

export default function NewPostPage() {
  return <PostForm />;
}
