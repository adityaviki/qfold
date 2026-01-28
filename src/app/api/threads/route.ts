import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/threads - Get root threads for the current user (no parent)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threads = await prisma.thread.findMany({
      where: {
        userId: session.user.id,
        parentThreadId: null, // Only root threads
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        _count: {
          select: { childThreads: true }
        }
      },
    });

    return NextResponse.json(threads);
  } catch (error) {
    console.error("Failed to fetch threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}

// POST /api/threads - Create a new thread
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, selectedContext, parentMessageId, parentThreadId } = body;

    const thread = await prisma.thread.create({
      data: {
        title: title || "New Chat",
        userId: session.user.id,
        selectedContext,
        parentMessageId,
        parentThreadId,
      },
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error("Failed to create thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
