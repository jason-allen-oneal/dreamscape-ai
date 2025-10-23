// src/app/api/world/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Agent, run } from "@/lib/gemini";

export async function GET() {
  try {
    const dreams = await prisma.dream.findMany({
      where: { visibility: "WORLD" },
      include: {
        mediaItems: true,
        tags: {
          include: {
            tagDictionary: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const worldAgent = new Agent({
      name: "Dream World Synthesizer",
      instructions: `
You are a dream world synthesizer that creates a surreal, dreamlike interpretation of collective dreams.
Analyze the dreams provided and synthesize them into a world description with the following elements:

1. **Atmosphere**: Overall mood and ambiance of the dream world
2. **Dominant Themes**: Main recurring themes across dreams
3. **Emotional Landscape**: The collective emotional state
4. **Visual Elements**: Key visual motifs, colors, and imagery
5. **Symbolic Entities**: Recurring symbols or archetypes
6. **World Characteristics**: Physical or metaphysical properties of this dreamscape

Return a JSON object with these fields:
{
  "atmosphere": "description",
  "themes": ["theme1", "theme2", "theme3"],
  "emotionalLandscape": "description",
  "visualElements": {
    "colors": ["color1", "color2"],
    "motifs": ["motif1", "motif2"]
  },
  "entities": ["entity1", "entity2"],
  "characteristics": "description"
}
Ensure the JSON is valid and parseable.
      `,
      tools: [],
    });

    const dreamSummaries = dreams
      .map(
        (dream) => `
Dream Summary: ${dream.summary || "Untitled"}
Dream Content: ${dream.rawText}
Emotion: ${dream.emotion || "Unknown"}
Tags: ${dream.tags
          ?.map((tag) => tag.tagDictionary.value)
          .join(", ") || "None"}
      `.trim(),
      )
      .join("\n\n---\n\n");

    const synthesis = await run(worldAgent, dreamSummaries || "No dreams found.");

    let worldData = null;
    try {
      worldData = JSON.parse(synthesis.finalOutput);
    } catch {
      worldData = {
        atmosphere: "A quiet void awaiting shared visions.",
        themes: [],
        emotionalLandscape: "Dormant.",
        visualElements: { colors: [], motifs: [] },
        entities: [],
        characteristics:
          "The world is still forming, waiting for dreamers to contribute.",
      };
    }

    return NextResponse.json({
      worldData,
      dreamCount: dreams.length,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to synthesize dream world";
    console.error(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
