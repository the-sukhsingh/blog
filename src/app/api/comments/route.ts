import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/comments — public comment submission
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { postId, authorName, authorEmail, content } = body;

  if (!postId || !authorName || !authorEmail || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(authorEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (content.trim().length < 3 || content.trim().length > 2000) {
    return NextResponse.json(
      { error: "Comment must be between 3 and 2000 characters" },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      name: authorName,
      email: authorEmail,
      content: content.trim(),
      approved: false, // requires moderation before public display
    },
  });

  return NextResponse.json(
    { id: comment.id, message: "Your comment is awaiting moderation." },
    { status: 201 },
  );
}
