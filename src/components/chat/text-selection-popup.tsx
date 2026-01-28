"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, GitBranch, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextSelectionPopupProps {
  selectedText: string;
  position: { x: number; y: number };
  onAskInThread: () => void;
  onAskInNewThread: () => void;
  onClose: () => void;
}

export function TextSelectionPopup({
  selectedText,
  position,
  onAskInThread,
  onAskInNewThread,
  onClose,
}: TextSelectionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Calculate popup position with better viewport awareness
  const popupWidth = 320;
  const popupHeight = 140;
  const padding = 16;

  const left = Math.max(
    padding,
    Math.min(position.x - popupWidth / 2, window.innerWidth - popupWidth - padding)
  );
  const top = Math.max(
    padding,
    position.y - popupHeight - 8
  );

  const popupStyle = { left, top };

  const truncatedText =
    selectedText.length > 60 ? selectedText.slice(0, 60) + "..." : selectedText;

  return (
    <div
      ref={popupRef}
      className="fixed z-50 animate-scale-in"
      style={popupStyle}
    >
      <div className="bg-popover border rounded-xl shadow-xl overflow-hidden w-80">
        {/* Header with selected text preview */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 border-b">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Selected text
            </p>
            <p className="text-sm line-clamp-2 italic">&ldquo;{truncatedText}&rdquo;</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Actions */}
        <div className="p-2 space-y-1">
          <ActionButton
            icon={<MessageSquarePlus className="h-4 w-4" />}
            label="Ask about this"
            description="Continue in current thread"
            onClick={onAskInThread}
          />
          <ActionButton
            icon={<GitBranch className="h-4 w-4" />}
            label="Create branch"
            description="Start a new focused conversation"
            onClick={onAskInNewThread}
            highlight
          />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  onClick,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
        "hover:bg-muted/80 active:scale-[0.98]",
        highlight && "hover:bg-primary/10"
      )}
    >
      <div
        className={cn(
          "p-2 rounded-lg",
          highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", highlight && "text-primary")}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
