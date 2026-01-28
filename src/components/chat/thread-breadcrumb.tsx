"use client";

import Link from "next/link";
import { ChevronRight, Home, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  id: string;
  title: string;
  selectedContext?: string | null;
}

interface ThreadBreadcrumbProps {
  breadcrumbs: Breadcrumb[];
  currentTitle: string;
  currentContext?: string | null;
}

export function ThreadBreadcrumb({
  breadcrumbs,
  currentTitle,
  currentContext,
}: ThreadBreadcrumbProps) {
  if (breadcrumbs.length === 0) {
    return null;
  }

  const depth = breadcrumbs.length;

  return (
    <nav className="flex items-center gap-1 text-sm px-4 py-2.5 bg-gradient-to-r from-muted/50 to-transparent border-b overflow-x-auto scrollbar-thin">
      {/* Home link */}
      <Link
        href="/"
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted transition-colors shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline text-xs">Home</span>
      </Link>

      {/* Breadcrumb items */}
      {breadcrumbs.map((crumb, index) => (
        <BreadcrumbItem
          key={crumb.id}
          crumb={crumb}
          isFirst={index === 0}
          depth={index + 1}
        />
      ))}

      {/* Current item */}
      <div className="flex items-center gap-1 shrink-0">
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20"
            )}
          >
            <GitBranch className="h-3 w-3 text-primary" />
            <span
              className="text-foreground font-medium max-w-[150px] truncate text-xs"
              title={currentTitle}
            >
              {currentTitle}
            </span>
          </div>
          {depth > 0 && (
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded-full">
              depth {depth}
            </span>
          )}
        </div>
      </div>

      {/* Context preview if available */}
      {currentContext && (
        <div className="ml-2 flex items-center gap-1 shrink-0">
          <span className="text-xs text-muted-foreground">from:</span>
          <span
            className="text-xs italic text-muted-foreground max-w-[200px] truncate"
            title={currentContext}
          >
            &ldquo;{currentContext.slice(0, 50)}...&rdquo;
          </span>
        </div>
      )}
    </nav>
  );
}

function BreadcrumbItem({
  crumb,
  isFirst,
  depth,
}: {
  crumb: Breadcrumb;
  isFirst: boolean;
  depth: number;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0 group">
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      <Link
        href={`/chat/${crumb.id}`}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
          "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
        title={crumb.title}
      >
        {isFirst && <GitBranch className="h-3 w-3 opacity-60" />}
        <span className="max-w-[120px] truncate text-xs">{crumb.title}</span>
      </Link>
    </div>
  );
}
