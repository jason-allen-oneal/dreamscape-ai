import prisma from "./prisma";
import fs from "fs";
import path from "path";
import Agent from "@/lib/gemini";

import { getGeneratedDir, listGeneratedAssets, findGeneratedAsset, normalizePublicPath } from "@/lib/client";
import { Content } from "@google/genai";

export function parseGeminiJSON(raw: string) {
    // Remove code fences
    const cleaned = raw
        .replace(/```json/, "")
        .replace(/```/g, "")
        .trim();
    return JSON.parse(cleaned);
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

export async function generateWorld(dreams: DreamWithMediaAndTags[]) {
    const allMediaItems = dreams.flatMap(dream => dream.mediaItems || []);
    const imageMediaItems = allMediaItems.filter(item => item.kind === "IMAGE");

    const generatedDir = getGeneratedDir();
    if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, { recursive: true });
    }

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

    try {
        const description: string = await Agent.getDescription(dreamSummaries);

        if (!description) {
            throw new Error("No description generated");
        }

        let backgroundImage: string | null = null;
        let floating1: string | null = null;
        let floating2: string | null = null;
        let videoAsset: string | null = null;
        let music: string | null = null;

        try {
            backgroundImage = await Agent.getImage("background", description);
        } catch (error) {
            console.error("Failed to generate dream world background:", error);
            backgroundImage = findGeneratedAsset("background.png");
        }

        try {
            floating1 = await Agent.getImage("floating1", description);
        } catch (error) {
            console.error("Failed to generate floating overlay #1:", error);
            floating1 = findGeneratedAsset("floating1.png");
        }
    
        try {
            floating2 = await Agent.getImage("floating2", description);
        } catch (error) {
            console.error("Failed to generate floating overlay #2:", error);
            floating2 = findGeneratedAsset("floating2.png");
        }

        try {
            const generatedVideoPath = await Agent.getVideo(description);
            videoAsset = normalizePublicPath(generatedVideoPath);
        } catch (error) {
            console.error("Failed to generate dream world video:", error);
            const existingVideos = listGeneratedAssets(/^video.mp4$/i);
            videoAsset = existingVideos.length ? existingVideos[existingVideos.length - 1] : "";
        }

        try {
            music = await Agent.getMusic(description) as string;
        } catch (error) {
            console.error("Failed to generate dream world music:", error);
            const existingMusic = findGeneratedAsset(/^music\.[a-z0-9]+$/i);
            music = existingMusic;
        }

        const assetSnapshot: WorldAssetSnapshot = {
            background: backgroundImage || undefined,
            floating1: floating1 || undefined,
            floating2: floating2 || undefined,
            video: videoAsset || undefined,
            music: music || undefined,
        };

        const generatedTimestamp = (new Date().getTime() / 1000).toString();
        await updateConfig("lastGenerated", generatedTimestamp);
        await updateConfig("lastDescription", description);
        await updateConfig("lastAssets", JSON.stringify(assetSnapshot));

        return {
            description,
            images: [
                backgroundImage,
                floating1,
                floating2,
            ],
            video: videoAsset,
            music,
        }
    } catch (error) {
        throw new Error(`Failed to generate world description: ${error}`);
    }
}
