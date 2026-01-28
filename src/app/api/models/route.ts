import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export interface ModelInfo {
  id: string;
  name: string;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json([
        { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      ]);
    }

    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });

    if (!response.ok) {
      return NextResponse.json([
        { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      ]);
    }

    const data = await response.json();
    const models = data.data
      .filter((m: { type: string }) => m.type === "model")
      .map((m: { id: string; display_name: string }) => ({
        id: m.id,
        name: m.display_name,
      }));

    return NextResponse.json(models);
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return NextResponse.json([
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
    ]);
  }
}
