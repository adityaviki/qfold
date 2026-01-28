"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Trash2, Inbox } from "lucide-react";

interface Thread {
  id: string;
  title: string;
  updatedAt: string;
}

interface ThreadListProps {
  threads: Thread[];
  onDeleteThread: (id: string) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ThreadList({ threads, onDeleteThread }: ThreadListProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleThreadClick = (threadId: string) => {
    router.push(`/chat/${threadId}`);
  };

  return (
    <ScrollArea className="flex-1 scrollbar-thin">
      <div className="space-y-1 p-2">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="p-3 rounded-xl bg-muted/50 mb-3">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Start a new chat to begin
            </p>
          </div>
        ) : (
          threads.map((thread) => {
            const isActive = pathname === `/chat/${thread.id}`;
            return (
              <div
                key={thread.id}
                className={cn(
                  "group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer",
                  "hover:bg-accent/80",
                  isActive && "bg-accent shadow-sm"
                )}
                onClick={() => handleThreadClick(thread.id)}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg mt-0.5 shrink-0 transition-colors",
                    isActive ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <MessageSquare
                    className={cn(
                      "h-3.5 w-3.5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "truncate font-medium",
                      isActive && "text-primary"
                    )}
                  >
                    {thread.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(thread.updatedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 shrink-0 transition-all",
                    "opacity-0 group-hover:opacity-100",
                    "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteThread(thread.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
