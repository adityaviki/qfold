import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

// Helper to build breadcrumb path by traversing parent threads
async function buildBreadcrumbs(
  parentThreadId: string | null,
  userId: string
): Promise<{ id: string; title: string }[]> {
  const breadcrumbs: { id: string; title: string }[] = [];
  let currentId = parentThreadId;

  while (currentId) {
    const thread = await prisma.thread.findUnique({
      where: { id: currentId, userId },
      select: { id: true, title: true, parentThreadId: true },
    });

    if (!thread) break;

    breadcrumbs.unshift({ id: thread.id, title: thread.title });
    currentId = thread.parentThreadId;
  }

  return breadcrumbs;
}

// GET /api/threads/[threadId] - Get a specific thread with hierarchy
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;

    const thread = await prisma.thread.findUnique({
      where: {
        id: threadId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        childThreads: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            selectedContext: true,
            parentMessageId: true,
            createdAt: true,
            _count: {
              select: { childThreads: true }
            }
          }
        }
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Build breadcrumb path from parent chain
    const breadcrumbs = await buildBreadcrumbs(thread.parentThreadId, session.user.id);

    return NextResponse.json({
      ...thread,
      breadcrumbs,
    });
  } catch (error) {
    console.error("Failed to fetch thread:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    );
  }
}

// PATCH /api/threads/[threadId] - Update a thread
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;
    const body = await request.json();
    const { title } = body;

    const thread = await prisma.thread.update({
      where: {
        id: threadId,
        userId: session.user.id,
      },
      data: { title },
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error("Failed to update thread:", error);
    return NextResponse.json(
      { error: "Failed to update thread" },
      { status: 500 }
    );
  }
}

// DELETE /api/threads/[threadId] - Delete a thread
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;

    await prisma.thread.delete({
      where: {
        id: threadId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete thread:", error);
    return NextResponse.json(
      { error: "Failed to delete thread" },
      { status: 500 }
    );
  }
}
