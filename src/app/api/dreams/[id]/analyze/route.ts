// src/app/api/dreams/[id]/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Agent, run } from "@/lib/gemini";

interface Params {
  id: string;
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dream = await prisma.dream.findUnique({
      where: { id: params.id },
      include: {
        mediaItems: true,
        tags: { include: { tagDictionary: true } },
      },
    });

    if (!dream || dream.userId !== session.user.id) {
      return NextResponse.json({ error: "Dream not found" }, { status: 404 });
    }

    // Create a dream analysis agent
    const analysisAgent = new Agent({
      name: "Dream Analyst",
      instructions: `
You are an expert dream analyst with knowledge of psychology, symbolism, and dream interpretation.
Analyze the following dream and provide a comprehensive interpretation that includes:

1. **Overall Theme**: What is the main theme or message of the dream?
2. **Symbols and Their Meanings**: Identify key symbols and explain their potential meanings
3. **Emotional Landscape**: Analyze the emotional context and what it might represent
4. **Psychological Insights**: Provide insights into what the dream might reveal about the dreamer's subconscious
5. **Archetypal Elements**: Identify any Jungian archetypes or universal symbols
6. **Personal Reflection Prompts**: Suggest questions for the dreamer to reflect on

Be thoughtful, insightful, and empathetic in your analysis. Format your response in a clear, structured way using markdown.
      `,
      tools: [],
    });

    // Prepare the dream content for analysis
    const dreamContent = `
Dream Summary: ${dream.summary || "Untitled"}
Dream Content: ${dream.rawText}
Emotion: ${dream.emotion || "Unknown"}
Date: ${dream.createdAt.toISOString()}
Tags: ${dream.tags?.map(t => t.tagDictionary.value).join(", ") || "None"}
    `.trim();

    const analysisResult = await run(analysisAgent, dreamContent);

    return NextResponse.json({ 
      analysis: analysisResult.finalOutput,
      dreamId: dream.id 
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to analyze dream";
    console.error(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
