// src/app/api/world/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Agent, run } from "@/lib/gemini";

export async function GET() {
  try {
    // Fetch all world-visible dreams
    const dreams = await prisma.dream.findMany({
      where: { visibility: "WORLD" },
      include: {
        mediaItems: true,
        tags: {
          include: {
            tagDictionary: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to last 50 dreams for performance
    });

    // Create a world synthesis agent
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
      `,
      tools: [],
    });

    // Prepare dream data for synthesis
    const dreamSummaries = dreams.slice(0, 20).map(d => ({
      summary: d.summary,
      emotion: d.emotion,
      tags: d.tags?.map(t => t.tagDictionary.value).join(", "),
      intensity: d.intensity,
    }));

    const prompt = `Synthesize a dream world from these dreams:\n\n${JSON.stringify(dreamSummaries, null, 2)}`;

    let worldData = {
      atmosphere: "A mysterious twilight realm where consciousness drifts",
      themes: ["transformation", "exploration", "connection"],
      emotionalLandscape: "Ethereal and introspective",
      visualElements: {
        colors: ["deep purple", "cyan", "fuchsia"],
        motifs: ["floating particles", "nebular clouds", "crystalline structures"]
      },
      entities: ["dream wanderers", "memory echoes", "symbolic guardians"],
      characteristics: "A space where time flows like water and thoughts become tangible"
    };

    if (dreams.length > 0) {
      try {
        const synthesisResult = await run(worldAgent, prompt);
        // Try to parse the result as JSON
        const jsonMatch = synthesisResult.finalOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          worldData = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn("Failed to synthesize world data, using defaults", err);
      }
    }

    return NextResponse.json({
      worldData,
      dreamCount: dreams.length,
      recentDreams: dreams.slice(0, 10).map(d => ({
        id: d.id,
        summary: d.summary,
        emotion: d.emotion,
        intensity: d.intensity,
      })),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch world data";
    console.error(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
