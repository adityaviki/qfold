import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";

interface ChatPageProps {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{ context?: string }>;
}

// Helper to build breadcrumb path by traversing parent threads
async function buildBreadcrumbs(
  threadId: string | null,
  userId: string
): Promise<{ id: string; title: string; selectedContext?: string | null }[]> {
  const breadcrumbs: { id: string; title: string; selectedContext?: string | null }[] = [];
  let currentId = threadId;

  while (currentId) {
    const thread = await prisma.thread.findUnique({
      where: { id: currentId, userId },
      select: { id: true, title: true, parentThreadId: true, selectedContext: true },
    });

    if (!thread) break;

    breadcrumbs.unshift({
      id: thread.id,
      title: thread.title,
      selectedContext: thread.selectedContext,
    });
    currentId = thread.parentThreadId;
  }

  return breadcrumbs;
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { threadId } = await params;
  await searchParams; // Consume searchParams to avoid warning

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
            select: { childThreads: true },
          },
        },
      },
    },
  });

  if (!thread) {
    notFound();
  }

  // Build breadcrumbs from parent chain (excluding current thread)
  const breadcrumbs = await buildBreadcrumbs(
    (thread as { parentThreadId?: string | null }).parentThreadId ?? null,
    session.user.id
  );

  const initialMessages = thread.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  const childThreads = thread.childThreads.map((t) => ({
    id: t.id,
    title: t.title,
    selectedContext: t.selectedContext,
    parentMessageId: t.parentMessageId,
    createdAt: t.createdAt.toISOString(),
    _count: t._count,
  }));

  return (
    <ChatInterface
      threadId={threadId}
      threadTitle={thread.title}
      initialMessages={initialMessages}
      breadcrumbs={breadcrumbs}
      childThreads={childThreads}
      selectedContext={(thread as { selectedContext?: string | null }).selectedContext}
    />
  );
}
