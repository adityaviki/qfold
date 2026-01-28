"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MessageSquare,
  GitBranch,
  Sparkles,
  ArrowRight,
  Layers,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleNewChat = async () => {
    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (response.ok) {
        const thread = await response.json();
        router.push(`/chat/${thread.id}`);
      }
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted/20">
      <div className="text-center space-y-8 max-w-2xl animate-fade-in">
        {/* Hero */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 border border-primary/20">
                <Sparkles className="h-14 w-14 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to <span className="text-primary">QFold</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your AI conversation companion with the power of branching threads.
            Explore ideas without losing context.
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={handleNewChat}
          size="lg"
          className="gap-2 px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Start New Chat
          <ArrowRight className="h-5 w-5 ml-1" />
        </Button>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          <FeatureCard
            icon={<MessageSquare className="h-5 w-5" />}
            title="Smart Conversations"
            description="Chat with AI that remembers your context and provides thoughtful responses"
          />
          <FeatureCard
            icon={<GitBranch className="h-5 w-5" />}
            title="Branch Threads"
            description="Select any text to create a focused sub-conversation without losing the main thread"
          />
          <FeatureCard
            icon={<Layers className="h-5 w-5" />}
            title="Deep Exploration"
            description="Nest branches infinitely to explore topics at any level of depth"
          />
        </div>

        {/* How it works */}
        <div className="pt-8 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            How it works
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <Step number={1} text="Start a conversation" />
            <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Step number={2} text="Select text from response" />
            <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Step number={3} text="Create a branch to dive deeper" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
        {number}
      </span>
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}
