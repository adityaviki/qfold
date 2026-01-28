import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/messages - Create a new message
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { threadId, role, content, selectedText } = body;

    // Verify the thread belongs to the user
    const thread = await prisma.thread.findUnique({
      where: {
        id: threadId,
        userId: session.user.id,
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        threadId,
        role,
        content,
        selectedText,
      },
    });

    // Update thread's updatedAt
    await prisma.thread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Failed to create message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
