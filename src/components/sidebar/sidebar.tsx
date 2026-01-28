"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThreadList } from "./thread-list";
import { Plus, LogOut, Menu, X, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

interface Thread {
  id: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  userName?: string | null;
}

export function Sidebar({ userName }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchThreads = async () => {
    try {
      const response = await fetch("/api/threads");
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleNewChat = async () => {
    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (response.ok) {
        const thread = await response.json();
        setThreads((prev) => [thread, ...prev]);
        router.push(`/chat/${thread.id}`);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  const handleDeleteThread = async (id: string) => {
    try {
      const response = await fetch(`/api/threads/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setThreads((prev) => prev.filter((t) => t.id !== id));
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm border shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-72 flex-col border-r bg-background/95 backdrop-blur-sm transition-transform duration-300 md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">QFold</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={handleNewChat}
            className="w-full gap-2 rounded-xl shadow-sm"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <Separator />

        {/* Thread List */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading chats...</p>
            </div>
          </div>
        ) : (
          <ThreadList threads={threads} onDeleteThread={handleDeleteThread} />
        )}

        <Separator />

        {/* User section */}
        <div className="p-3 space-y-2">
          {userName && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/50">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">Signed in</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}

export function useSidebarRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);
  return {
    refreshKey,
    refresh: () => setRefreshKey((k) => k + 1),
  };
}
