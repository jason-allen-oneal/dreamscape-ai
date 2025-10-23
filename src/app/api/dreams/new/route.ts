// src/app/api/dreams/new/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Agent, run } from "@/lib/gemini";
import { parseGeminiJSON } from "@/lib/utils";
import dbTools from "@/lib/tools";
import {
  DreamSourceType,
  DreamVisibility,
  EmotionType,
  MediaKind,
  Prisma,
  TagType,
} from "@prisma/client";

type SourceType = DreamSourceType;

interface JsonMediaItem {
  url?: unknown;
  kind?: unknown;
  mime?: unknown;
}

interface JsonBody {
  rawText?: unknown;
  visibility?: unknown;
  sourceType?: unknown;
  mediaItems?: JsonMediaItem[];
}

interface GeminiTag {
  type?: unknown;
  value?: unknown;
  weight?: unknown;
}

interface ParsedDream {
  summary?: unknown;
  tags?: GeminiTag[];
  sentiment?: unknown;
  valence?: unknown;
  arousal?: unknown;
  intensity?: unknown;
  emotion?: unknown;
}

const isDreamVisibility = (value: unknown): value is DreamVisibility =>
  typeof value === "string" &&
  Object.values(DreamVisibility).includes(value as DreamVisibility);

const isDreamSourceType = (value: unknown): value is DreamSourceType =>
  typeof value === "string" &&
  Object.values(DreamSourceType).includes(value as DreamSourceType);

const isMediaKind = (value: unknown): value is MediaKind =>
  typeof value === "string" &&
  Object.values(MediaKind).includes(value as MediaKind);

const isEmotionType = (value: unknown): value is EmotionType =>
  typeof value === "string" &&
  Object.values(EmotionType).includes(value as EmotionType);

const isTagType = (value: unknown): value is TagType =>
  typeof value === "string" && Object.values(TagType).includes(value as TagType);

const parseVisibility = (value: unknown): DreamVisibility =>
  isDreamVisibility(value) ? value : DreamVisibility.PRIVATE;

const parseSourceType = (value: unknown): DreamSourceType =>
  isDreamSourceType(value) ? value : DreamSourceType.TEXT;

const mapFormFieldToMediaKind = (fieldName: string): MediaKind => {
  const normalized = fieldName.toUpperCase();
  if (normalized.includes("AUDIO")) return MediaKind.AUDIO;
  if (normalized.includes("SKETCH")) return MediaKind.SKETCH;
  if (normalized.includes("VIDEO")) return MediaKind.VIDEO;
  return MediaKind.IMAGE;
};

const fallbackParsed: ParsedDream = {
  summary: "",
  tags: [],
  sentiment: 0,
  valence: 0.5,
  arousal: 0.5,
  intensity: 0.5,
  emotion: undefined,
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawText = "";
    let visibility: DreamVisibility = DreamVisibility.PRIVATE;
    let sourceType: SourceType = DreamSourceType.TEXT;
    const mediaItems: Prisma.MediaCreateWithoutDreamInput[] = [];

    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData();
      rawText = formData.get("rawText")?.toString() ?? "";
      visibility = parseVisibility(formData.get("visibility"));
      sourceType = parseSourceType(formData.get("sourceType"));

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          const fileName = `${Date.now()}-${value.name}`;
          const filePath = `/public/uploads/${fileName}`;
          mediaItems.push({
            kind: mapFormFieldToMediaKind(key),
            url: filePath,
            mime: value.type,
          });
        }
      }
    } else {
      const body = (await req.json()) as JsonBody;
      rawText = typeof body.rawText === "string" ? body.rawText : "";
      visibility = parseVisibility(body.visibility);
      sourceType = parseSourceType(body.sourceType);

      if (Array.isArray(body.mediaItems)) {
        body.mediaItems.forEach((item) => {
          if (!item || typeof item.url !== "string") {
            return;
          }

          const kind = isMediaKind(item.kind) ? item.kind : MediaKind.IMAGE;
          mediaItems.push({
            url: item.url,
            kind,
            mime:
              typeof item.mime === "string" ? item.mime : "application/octet-stream",
          });
        });
      }
    }

    if (!rawText && sourceType === DreamSourceType.TEXT) {
      return NextResponse.json({ error: "rawText is required" }, { status: 400 });
    }

    let parsed: ParsedDream = { ...fallbackParsed };

    if (sourceType === DreamSourceType.TEXT) {
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
        const parsedResult = parseGeminiJSON(output.finalOutput) as ParsedDream;
        if (parsedResult && typeof parsedResult === "object") {
          parsed = {
            ...fallbackParsed,
            ...parsedResult,
            tags: Array.isArray(parsedResult.tags) ? parsedResult.tags : [],
          };
        }
      } catch (error) {
        console.warn("Gemini failed, falling back to defaults", error);
        parsed = { ...fallbackParsed };
      }
    }

    const sentiment =
      typeof parsed.sentiment === "number" ? parsed.sentiment : null;
    const valence = typeof parsed.valence === "number" ? parsed.valence : null;
    const arousal = typeof parsed.arousal === "number" ? parsed.arousal : null;
    const intensity =
      typeof parsed.intensity === "number" ? parsed.intensity : null;
    const emotionCandidate =
      typeof parsed.emotion === "string" ? parsed.emotion : undefined;
    const emotion = isEmotionType(emotionCandidate)
      ? emotionCandidate
      : null;
    const summary =
      typeof parsed.summary === "string" ? parsed.summary : "";

    const userIdentifiers: Prisma.UserWhereInput[] = [];
    if (session.user.id) {
      userIdentifiers.push({ id: session.user.id as string });
    }
    if (typeof session.user.name === "string" && session.user.name.trim()) {
      userIdentifiers.push({ username: session.user.name });
    }

    if (userIdentifiers.length === 0) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 },
      );
    }

    const userRecord = await prisma.user.findFirst({
      where: { OR: userIdentifiers },
      select: { id: true },
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 },
      );
    }

    const dream = await prisma.dream.create({
      data: {
        userId: userRecord.id,
        rawText,
        summary,
        sentiment,
        valence,
        arousal,
        intensity,
        emotion,
        visibility,
        sourceType,
        mediaItems: { create: mediaItems },
      },
    });

    const createTagTool = dbTools.find((tool) => tool.name === "createTag");
    if (createTagTool?.function && Array.isArray(parsed.tags)) {
      for (const tag of parsed.tags) {
        if (!isTagType(tag.type) || typeof tag.value !== "string") {
          continue;
        }

        await createTagTool.function({
          type: tag.type,
          value: tag.value,
          weight: typeof tag.weight === "number" ? tag.weight : undefined,
          dreamId: dream.id,
        });
      }
    }

    return NextResponse.json({ dream });
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to create dream";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
