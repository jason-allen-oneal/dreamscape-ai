// src/app/api/world/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Agent from "@/lib/gemini";
import { updateConfig } from "@/lib/utils";
import { test } from "@/lib/testDreams";
import fs from "fs";
import path from "path";
import { generateWorld } from "@/lib/utils";

export async function GET() {
  try {
    /*
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
    */

    const dreams = test.dreams;
    console.log("dreams", JSON.stringify(dreams));

    const data = await generateWorld(dreams);

    console.log("data", data);

    return NextResponse.json({
      description: data.description,
      images: data.images,
      video: data.video ?? null,
      music: data.music,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to synthesize dream world";
    console.error(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
