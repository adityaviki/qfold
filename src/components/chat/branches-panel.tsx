"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  ChevronRight,
  ChevronDown,
  MessageSquareQuote,
  X,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChildThread {
  id: string;
  title: string;
  selectedContext: string | null;
  parentMessageId: string | null;
  createdAt: string;
  _count: {
    childThreads: number;
  };
}

interface BranchesPanelProps {
  childThreads: ChildThread[];
  isOpen: boolean;
  onToggle: () => void;
}

export function BranchesPanel({
  childThreads,
  isOpen,
  onToggle,
}: BranchesPanelProps) {
  if (childThreads.length === 0 && !isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        "border-l bg-gradient-to-b from-background to-muted/20 transition-all duration-300 flex flex-col overflow-hidden",
        isOpen ? "w-80" : "w-0"
      )}
    >
      {isOpen && (
        <div className="animate-fade-in flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GitBranch className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Branches</h3>
                <p className="text-xs text-muted-foreground">
                  {childThreads.length} conversation
                  {childThreads.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 scrollbar-thin">
            <div className="p-3">
              {childThreads.length === 0 ? (
                <EmptyBranchesState />
              ) : (
                <div className="space-y-2">
                  {childThreads.map((thread, index) => (
                    <BranchItem
                      key={thread.id}
                      thread={thread}
                      isLast={index === childThreads.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function EmptyBranchesState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
        <div className="relative p-4 rounded-xl bg-muted/50 border border-dashed border-border">
          <GitBranch className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <p className="text-sm font-medium mb-1">No branches yet</p>
      <p className="text-xs text-muted-foreground max-w-[200px]">
        Select text in a response and click &quot;New branch&quot; to explore a
        topic in depth.
      </p>
    </div>
  );
}

function BranchItem({
  thread,
  isLast,
}: {
  thread: ChildThread;
  isLast: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasContext = thread.selectedContext && thread.selectedContext.length > 0;
  const hasNestedBranches = thread._count.childThreads > 0;

  const formattedDate = new Date(thread.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime = new Date(thread.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className={cn(
        "relative animate-slide-in-right",
        !isLast && "pb-2"
      )}
    >
      {/* Tree connector line */}
      {!isLast && (
        <div className="absolute left-[18px] top-[40px] bottom-0 w-0.5 bg-gradient-to-b from-border to-transparent" />
      )}

      <div className="relative rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
        {/* Header with link */}
        <Link
          href={`/chat/${thread.id}`}
          className="block p-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            {/* Branch icon with tree node */}
            <div className="relative">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <GitBranch className="h-4 w-4 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {thread.title}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formattedDate}, {formattedTime}
                </span>
                {hasNestedBranches && (
                  <span className="flex items-center gap-1 text-xs text-primary/80">
                    <Layers className="h-3 w-3" />
                    {thread._count.childThreads}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow indicator */}
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </div>
        </Link>

        {/* Context section */}
        {hasContext && (
          <div className="border-t border-dashed">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <MessageSquareQuote className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">Source context</span>
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 ml-auto" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              )}
            </button>
            {isExpanded && (
              <div className="px-3 pb-3 animate-fade-in">
                <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                  <p className="text-xs italic text-muted-foreground leading-relaxed line-clamp-4">
                    &ldquo;{thread.selectedContext}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Toggle button shown in the chat header when there are branches
export function BranchesToggle({
  count,
  isOpen,
  onToggle,
}: {
  count: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant={count > 0 ? "outline" : "ghost"}
      size="sm"
      onClick={onToggle}
      className={cn(
        "gap-2 transition-all",
        count > 0 && "border-primary/30 hover:border-primary/50"
      )}
    >
      <GitBranch className={cn("h-4 w-4", count > 0 && "text-primary")} />
      {count > 0 && (
        <>
          <span className="font-medium">{count}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            branch{count !== 1 ? "es" : ""}
          </span>
        </>
      )}
      {isOpen ? (
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </Button>
  );
}
