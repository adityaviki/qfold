"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Model {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

// Helper to get a friendly model name
function getModelDisplayName(modelId: string, modelName: string): string {
  // Extract the main model name for cleaner display
  if (modelId.includes("claude-3-5-sonnet")) return "Claude 3.5 Sonnet";
  if (modelId.includes("claude-3-5-haiku")) return "Claude 3.5 Haiku";
  if (modelId.includes("claude-3-opus")) return "Claude 3 Opus";
  if (modelId.includes("claude-3-sonnet")) return "Claude 3 Sonnet";
  if (modelId.includes("claude-3-haiku")) return "Claude 3 Haiku";
  return modelName;
}

// Helper to get model tier for styling
function getModelTier(modelId: string): "fast" | "balanced" | "powerful" {
  if (modelId.includes("haiku")) return "fast";
  if (modelId.includes("opus")) return "powerful";
  return "balanced";
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/models");
        if (response.ok) {
          const data = await response.json();
          setModels(data);
          if (!value && data.length > 0) {
            onChange(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchModels();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 w-[220px] h-10 px-3 bg-muted/50 animate-pulse rounded-xl border">
        <div className="w-4 h-4 rounded bg-muted-foreground/20" />
        <div className="flex-1 h-4 rounded bg-muted-foreground/20" />
      </div>
    );
  }

  const selectedModel = models.find((m) => m.id === value);
  const tier = value ? getModelTier(value) : "balanced";

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || models.length === 0}>
      <SelectTrigger
        className={cn(
          "w-[220px] rounded-xl border-2 transition-all",
          "focus:ring-2 focus:ring-primary/20",
          value && "border-primary/30 bg-primary/5"
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-1 rounded-md",
              tier === "fast" && "bg-green-500/10 text-green-600 dark:text-green-400",
              tier === "balanced" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              tier === "powerful" && "bg-purple-500/10 text-purple-600 dark:text-purple-400"
            )}
          >
            {tier === "powerful" ? (
              <Sparkles className="h-3.5 w-3.5" />
            ) : (
              <Bot className="h-3.5 w-3.5" />
            )}
          </div>
          <SelectValue placeholder="Select model">
            {selectedModel ? getModelDisplayName(selectedModel.id, selectedModel.name) : "Select model"}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {models.map((model) => {
          const modelTier = getModelTier(model.id);
          return (
            <SelectItem
              key={model.id}
              value={model.id}
              className="rounded-lg my-0.5"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "p-1 rounded-md",
                    modelTier === "fast" && "bg-green-500/10 text-green-600 dark:text-green-400",
                    modelTier === "balanced" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                    modelTier === "powerful" && "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  )}
                >
                  {modelTier === "powerful" ? (
                    <Sparkles className="h-3 w-3" />
                  ) : (
                    <Bot className="h-3 w-3" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {getModelDisplayName(model.id, model.name)}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {modelTier === "fast" && "Fast & efficient"}
                    {modelTier === "balanced" && "Balanced"}
                    {modelTier === "powerful" && "Most capable"}
                  </span>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
