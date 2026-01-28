"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./message-item";
import { Sparkles, MessageSquare, GitBranch, Lightbulb } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onTextSelect?: (selectedText: string, position: { x: number; y: number }) => void;
}

export function MessageList({ messages, isLoading, onTextSelect }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 scrollbar-thin">
      <div className="space-y-4 max-w-3xl mx-auto pb-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
              <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 border border-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Start a conversation by typing a message below. Select text from responses to dive deeper.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
              <FeatureHint
                icon={<MessageSquare className="h-4 w-4" />}
                title="Ask anything"
                description="Get answers to your questions"
              />
              <FeatureHint
                icon={<GitBranch className="h-4 w-4" />}
                title="Create branches"
                description="Select text to explore deeper"
              />
              <FeatureHint
                icon={<Lightbulb className="h-4 w-4" />}
                title="Stay focused"
                description="Keep context organized"
              />
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            role={message.role}
            content={message.content}
            onTextSelect={onTextSelect}
            timestamp={message.createdAt ? new Date(message.createdAt) : undefined}
          />
        ))}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-4 p-4 animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-sm text-muted-foreground ml-1">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function FeatureHint({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground text-center">{description}</p>
    </div>
  );
}
