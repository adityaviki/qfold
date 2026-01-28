"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { TextSelectionPopup } from "./text-selection-popup";
import { ModelSelector } from "./model-selector";
import { ThreadBreadcrumb } from "./thread-breadcrumb";
import { BranchesPanel, BranchesToggle } from "./branches-panel";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface Breadcrumb {
  id: string;
  title: string;
  selectedContext?: string | null;
}

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

interface ChatInterfaceProps {
  threadId: string;
  threadTitle?: string;
  initialMessages?: Message[];
  breadcrumbs?: Breadcrumb[];
  childThreads?: ChildThread[];
  selectedContext?: string | null;
}

export function ChatInterface({
  threadId,
  threadTitle = "New Chat",
  initialMessages = [],
  breadcrumbs = [],
  childThreads = [],
  selectedContext: threadContext,
}: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectionPosition, setSelectionPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [contextText, setContextText] = useState<string | null>(null);
  const [branches, setBranches] = useState<ChildThread[]>(childThreads);
  const [isBranchesPanelOpen, setIsBranchesPanelOpen] = useState(
    childThreads.length > 0
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (content: string) => {
    if (!selectedModel || isLoading) return;

    // Build message with context if present
    let fullContent = content;
    if (contextText) {
      fullContent = `Regarding this text: "${contextText}"\n\n${content}`;
      setContextText(null);
    }

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: fullContent,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Save user message to database
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, role: "user", content: fullContent }),
    });

    // Update thread title if first message
    if (messages.length === 0) {
      fetch(`/api/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
        }),
      });
    }

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(true);

    // Call API with streaming
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        fullResponse += text;

        // Update the assistant message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, content: fullResponse } : m
          )
        );
      }

      // Save assistant message to database
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          role: "assistant",
          content: fullResponse,
        }),
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleTextSelect = useCallback(
    (text: string, position: { x: number; y: number }) => {
      setSelectedText(text);
      setSelectionPosition(position);
    },
    []
  );

  const handleAskInThread = () => {
    if (selectedText) {
      setContextText(selectedText);
      setSelectedText(null);
      setSelectionPosition(null);
    }
  };

  const handleAskInNewThread = async () => {
    if (selectedText) {
      try {
        // Find the last assistant message ID for context
        const lastAssistantMessage = [...messages]
          .reverse()
          .find((m) => m.role === "assistant");

        const response = await fetch("/api/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Branch: ${selectedText.slice(0, 30)}...`,
            selectedContext: selectedText,
            parentThreadId: threadId,
            parentMessageId: lastAssistantMessage?.id,
          }),
        });
        if (response.ok) {
          const thread = await response.json();
          // Add to local branches list
          setBranches((prev) => [
            {
              ...thread,
              _count: { childThreads: 0 },
            },
            ...prev,
          ]);
          // Open the branches panel if not already open
          setIsBranchesPanelOpen(true);
          router.push(`/chat/${thread.id}`);
        }
      } catch (error) {
        console.error("Failed to create thread:", error);
      }
      setSelectedText(null);
      setSelectionPosition(null);
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Breadcrumb navigation for nested threads */}
        {breadcrumbs.length > 0 && (
          <ThreadBreadcrumb
            breadcrumbs={breadcrumbs}
            currentTitle={threadTitle}
            currentContext={threadContext}
          />
        )}

        {/* Header with model selector and branches toggle */}
        <div className="flex items-center justify-between gap-4 border-b px-4 py-3 bg-background/80 backdrop-blur-sm">
          <ModelSelector
            value={selectedModel}
            onChange={setSelectedModel}
            disabled={isLoading}
          />
          <BranchesToggle
            count={branches.length}
            isOpen={isBranchesPanelOpen}
            onToggle={() => setIsBranchesPanelOpen(!isBranchesPanelOpen)}
          />
        </div>

        {/* Message list */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onTextSelect={handleTextSelect}
        />

        {/* Chat input */}
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading || !selectedModel}
          selectedContext={contextText || undefined}
          onClearContext={() => setContextText(null)}
          placeholder={selectedModel ? "Type your message..." : "Select a model to start..."}
        />

        {/* Text selection popup */}
        {selectedText && selectionPosition && (
          <TextSelectionPopup
            selectedText={selectedText}
            position={selectionPosition}
            onAskInThread={handleAskInThread}
            onAskInNewThread={handleAskInNewThread}
            onClose={() => {
              setSelectedText(null);
              setSelectionPosition(null);
            }}
          />
        )}
      </div>

      {/* Branches panel */}
      <BranchesPanel
        childThreads={branches}
        isOpen={isBranchesPanelOpen}
        onToggle={() => setIsBranchesPanelOpen(false)}
      />
    </div>
  );
}
