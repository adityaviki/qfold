"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  selectedContext?: string;
  onClearContext?: () => void;
}

export function ChatInput({
  onSend,
  isLoading,
  placeholder = "Type your message...",
  selectedContext,
  onClearContext,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Focus textarea when context is added
  useEffect(() => {
    if (selectedContext && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm">
      {/* Context banner */}
      {selectedContext && (
        <div className="px-4 pt-3 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                <Quote className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary mb-1">
                  Asking about selected text
                </p>
                <p className="text-sm text-foreground/80 line-clamp-2 italic">
                  &ldquo;{selectedContext}&rdquo;
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearContext}
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground hover:bg-primary/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div
            className={cn(
              "flex items-end gap-2 p-2 rounded-2xl border bg-background transition-all duration-200",
              "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30",
              selectedContext && "border-primary/30"
            )}
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className={cn(
                "flex-1 min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground/60"
              )}
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className={cn(
                "shrink-0 h-10 w-10 rounded-xl transition-all",
                input.trim() && !isLoading
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send
                className={cn(
                  "h-4 w-4 transition-transform",
                  input.trim() && !isLoading && "-rotate-45"
                )}
              />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
              Enter
            </kbd>{" "}
            to send,{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
              Shift + Enter
            </kbd>{" "}
            for new line
          </p>
        </form>
      </div>
    </div>
  );
}
