// src/app/api/dreams/new/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Agent, run } from "@/lib/gemini";
import { parseGeminiJSON } from "@/lib/utils";
import dbTools from "@/lib/tools";

type SourceType = "TEXT" | "VOICE" | "IMAGE" | "SKETCH";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawText = "";
    let visibility: "PRIVATE" | "WORLD" = "PRIVATE";
    let sourceType: SourceType = "TEXT";
    const mediaItems: any[] = [];

    // Handle FormData (files + fields)
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData();
      rawText = formData.get("rawText")?.toString() || "";
      visibility = (formData.get("visibility")?.toString() as "PRIVATE" | "WORLD") || "PRIVATE";
      sourceType = (formData.get("sourceType")?.toString() as SourceType) || "TEXT";

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          const fileName = `${Date.now()}-${value.name}`;
          const filePath = `/public/uploads/${fileName}`;
          // App Router: just reference path; skip fs write if not using server storage
          mediaItems.push({
            kind: key.includes("AUDIO") ? "AUDIO" : key.includes("SKETCH") ? "SKETCH" : "IMAGE",
            url: filePath,
            mime: value.type,
          });
        }
      }
    } else {
      const body = await req.json();
      rawText = body.rawText || "";
      visibility = body.visibility || "PRIVATE";
      sourceType = body.sourceType || "TEXT";
      mediaItems.push(...(body.mediaItems || []));
    }

    if (!rawText && sourceType === "TEXT") {
      return NextResponse.json({ error: "rawText is required" }, { status: 400 });
    }

    // Defaults in case Gemini fails
    let parsed: any = {
      summary: "",
      tags: [],
      sentiment: 0,
      valence: 0.5,
      arousal: 0.5,
      intensity: 0.5,
      emotion: "",
    };

    if (sourceType === "TEXT") {
      try {
        const dreamAgent = new Agent({
          name: "Dream Classifier",
          instructions: `
You are a dream analysis AI.
Classify the following dream and extract structured info:
- summary (one sentence)
- tags (type: ENTITY/ACTION/PLACE/EMOTION/ARCHETYPE/COLOR/SENSORY, value)
- sentiment (-1..1)
- valence (0..1)
- arousal (0..1)
- intensity (0..1)
- emotion (enum: JOY,SADNESS,FEAR,ANGER,SURPRISE,DISGUST,NEUTRAL,LOVE,ANXIETY,CALM)
Return JSON only.
          `,
          tools: dbTools,
        });

        const output = await run(dreamAgent, rawText);
        parsed = parseGeminiJSON(output.finalOutput);
      } catch (err) {
        console.warn("Gemini failed, falling back to defaults", err);
      }
    }

    // Create dream
    const dream = await prisma.dream.create({
      data: {
        userId: session.user.id,
        rawText,
        summary: parsed.summary || "",
        sentiment: parsed.sentiment,
        valence: parsed.valence,
        arousal: parsed.arousal,
        intensity: parsed.intensity,
        emotion: parsed.emotion,
        visibility,
        sourceType,
        mediaItems: { create: mediaItems },
      },
    });

    // Upsert tags using dbTools
    for (const tag of parsed.tags || []) {
      await dbTools[0].function({ 
        type: tag.type, 
        value: tag.value, 
        weight: tag.weight ?? 1,
        dreamId: dream.id
      });
    }

    return NextResponse.json({ dream });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to create dream" }, { status: 500 });
  }
}
