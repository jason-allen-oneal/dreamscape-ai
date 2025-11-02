// Re-export client-safe utilities
export { cn, parseGeminiJSON, sleep, normalizeUrl } from "./utils-client";
export type { WorldAssetSnapshot } from "./utils-client";

// Import for local use
import type { WorldAssetSnapshot } from "./utils-client";

// Server-side utilities that use Node.js modules
import prisma from "./prisma";
import fs from "fs";
import path from "path";
import Agent from "@/lib/gemini";

// Dream type for world generation
interface DreamTag {
  tagDictionary?: {
    value: string;
  };
  value?: string;
}

interface Dream {
  id: string;
  summary?: string;
  rawText: string;
  emotion?: string;
  mediaItems?: Array<{ kind: string; url: string; mime: string }>;
  tags?: DreamTag[];
}

export async function updateConfig(key: string, value: string) {
    await prisma.config.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
}

export async function getLastGeneration() {
    const config = await prisma.config.findUnique({
        where: { key: "lastGenerated" },
    });
    return config?.value;
}

export async function getLastDescription() {
  const config = await prisma.config.findUnique({
      where: { key: "lastDescription" },
  });
  return config?.value;
}

export async function getLastAssets(): Promise<WorldAssetSnapshot | null> {
  const config = await prisma.config.findUnique({
    where: { key: "lastAssets" },
  });

  if (!config?.value) {
    return null;
  }

  try {
    const parsed = JSON.parse(config.value) as WorldAssetSnapshot;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Failed to parse stored world assets:", error);
    return null;
  }
}

export async function generateWorld(dreams: Dream[]) {
    const allMediaItems = dreams.flatMap(dream => dream.mediaItems || []);
    const imageMediaItems = allMediaItems.filter(item => item.kind === "IMAGE");

    const generatedDir = path.join(process.cwd(), "public", "generated");
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const toPublicPath = (filePath: string): string => {
      const normalized = filePath.replace(/\\/g, "/");
      const publicRoot = path.join(process.cwd(), "public").replace(/\\/g, "/");
      if (normalized.startsWith(publicRoot)) {
        const relative = normalized.slice(publicRoot.length);
        return relative.startsWith("/") ? relative : `/${relative}`;
      }
      return normalized.startsWith("/") ? normalized : `/${normalized.replace(/^\/+/, "")}`;
    };

    const listGeneratedAssets = (pattern: RegExp): string[] => {
      try {
        if (!fs.existsSync(generatedDir)) {
          return [];
        }
        return fs
          .readdirSync(generatedDir)
          .filter((entry) => pattern.test(entry))
          .map((entry) => toPublicPath(path.join(generatedDir, entry)))
          .sort();
      } catch (error) {
        console.error("Failed to list generated assets:", error);
        return [];
      }
    };

    const findGeneratedAsset = (matcher: string | RegExp): string => {
      try {
        if (!fs.existsSync(generatedDir)) {
          return "";
        }
        if (typeof matcher === "string") {
          const candidatePath = path.join(generatedDir, matcher);
          return fs.existsSync(candidatePath) ? toPublicPath(candidatePath) : "";
        }
        const matches = listGeneratedAssets(matcher);
        return matches.length ? matches[matches.length - 1] : "";
      } catch (error) {
        console.error("Failed to inspect generated assets:", error);
        return "";
      }
    };

    const randomImages = imageMediaItems.sort(() => 0.5 - Math.random()).slice(0, 2);

    const imageContents = randomImages.map(item => {
      const imagePath = path.join(process.cwd(), "public", item.url);
      if (fs.existsSync(imagePath)) {
        const data = fs.readFileSync(imagePath).toString("base64");
        return { data, mimeType: item.mime };
      }
      return null;
    }).filter(Boolean);

    const dreamSummaries = dreams
      .map((dream) => {
        const tagValues =
          dream.tags
            ?.map((tag: DreamTag) => tag?.tagDictionary?.value ?? tag?.value ?? "")
            .filter(Boolean) ?? [];
        const formattedTags = tagValues.length ? tagValues.join(", ") : "None";

        return `
Dream Summary: ${dream.summary || "Untitled"}
Dream Content: ${dream.rawText}
Emotion: ${dream.emotion || "Unknown"}
Tags: ${formattedTags}
      `.trim();
      })
      .join("\n\n---\n\n");

    const description = await Agent.getDescription(dreamSummaries || "No dreams found.");

    let backgroundImage = "";
    let floating1 = "";
    let floating2 = "";
    let videoAsset = "";
    let music = "";

    try {
      backgroundImage = await Agent.getImage("background", description);
    } catch (error) {
      console.error("Failed to generate dream world background:", error);
      backgroundImage = findGeneratedAsset("background.png");
    }

    try {
      floating1 = await Agent.getImage("floating1", description, imageContents[0] ?? null);
    } catch (error) {
      console.error("Failed to generate floating overlay #1:", error);
      floating1 = findGeneratedAsset("floating1.png");
    }

    try {
      floating2 = await Agent.getImage("floating2", description, imageContents[1] ?? null);
    } catch (error) {
      console.error("Failed to generate floating overlay #2:", error);
      floating2 = findGeneratedAsset("floating2.png");
    }

    try {
      const generatedVideoPath = await Agent.getVideo(description);
      videoAsset = toPublicPath(generatedVideoPath);
    } catch (error) {
      console.error("Failed to generate dream world video:", error);
      const existingVideos = listGeneratedAssets(/^video-\d+\.mp4$/i);
      videoAsset = existingVideos.length ? existingVideos[existingVideos.length - 1] : "";
    }

    try {
      music = await Agent.getMusic(description) as string;
    } catch (error) {
      console.error("Failed to generate dream world music:", error);
      const existingMusic = findGeneratedAsset(/^music\.[a-z0-9]+$/i);
      music = existingMusic;
    }

    const generatedTimestamp = (new Date().getTime() / 1000).toString();
    await updateConfig("lastGenerated", generatedTimestamp);
    await updateConfig("lastDescription", description);
    const assetSnapshot: WorldAssetSnapshot = {
      background: backgroundImage || undefined,
      floating1: floating1 || undefined,
      floating2: floating2 || undefined,
      video: videoAsset || undefined,
      music: music || undefined,
    };
    await updateConfig("lastAssets", JSON.stringify(assetSnapshot));

    return {
        description,
        images: [backgroundImage, floating1, floating2],
        video: videoAsset || null,
        music
    }
}
