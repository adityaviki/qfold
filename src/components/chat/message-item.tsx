"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageItemProps {
  role: "user" | "assistant";
  content: string;
  onTextSelect?: (selectedText: string, position: { x: number; y: number }) => void;
  timestamp?: Date;
}

export function MessageItem({ role, content, onTextSelect, timestamp }: MessageItemProps) {
  const [copied, setCopied] = useState(false);

  const handleMouseUp = () => {
    if (!onTextSelect || role !== "assistant") return;

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        onTextSelect(selectedText, {
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = timestamp
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(timestamp)
    : null;

  return (
    <div
      className={cn(
        "message-container group relative flex gap-4 p-4 rounded-xl transition-all duration-200",
        role === "user"
          ? "bg-muted/60 hover:bg-muted/80"
          : "bg-gradient-to-br from-background to-muted/20 border border-border/50 shadow-sm"
      )}
    >
      <Avatar
        className={cn(
          "h-9 w-9 shrink-0 ring-2 ring-offset-2 ring-offset-background",
          role === "user" ? "ring-muted-foreground/20" : "ring-primary/20"
        )}
      >
        <AvatarFallback
          className={cn(
            role === "user" ? "bg-muted" : "bg-primary/10 text-primary"
          )}
        >
          {role === "user" ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 overflow-hidden" onMouseUp={handleMouseUp}>
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-sm font-semibold">
            {role === "user" ? "You" : "Assistant"}
          </p>
          {formattedTime && (
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
          )}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:text-foreground prose-pre:border prose-pre:border-border prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
      <div className="message-hover-actions absolute top-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
