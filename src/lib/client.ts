import path from "path";
import fs from "fs";

export function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export function parseGeminiJSON(raw: string) {
    // Remove code fences
    const cleaned = raw
        .replace(/```json/, "")
        .replace(/```/g, "")
        .trim();
    return JSON.parse(cleaned);
}

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getGeneratedDir() {
    return path.join(process.cwd(), "public", "generated");
}

export function normalizeUrl(url: string): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return url;
    return `/${url.replace(/^\/+/, "")}`;
}

export function normalizePublicPath(filePath: string): string {
    const normalized = filePath.replace(/\\/g, "/");
    const publicRoot = path.join(process.cwd(), "public").replace(/\\/g, "/");
    if (normalized.startsWith(publicRoot)) {
        const relative = normalized.slice(publicRoot.length);
        return relative.startsWith("/") ? relative : `/${relative}`;
    }
    return normalized.startsWith("/") ? normalized : `/${normalized.replace(/^\/+/, "")}`;
}

export function listGeneratedAssets(pattern: RegExp): string[] {
    try {
        const generatedDir = getGeneratedDir();

        if (!fs.existsSync(generatedDir)) {
            return [];
        }

        return fs
            .readdirSync(generatedDir)
            .filter((entry) => pattern.test(entry))
            .map((entry) => normalizePublicPath(path.join(generatedDir, entry)))
            .sort();
    } catch (error) {
        console.error("Failed to list generated assets:", error);
        return [];
    }
}

export function findGeneratedAsset(matcher: string | RegExp): string {
    try {
        const generatedDir = getGeneratedDir();

        if (!fs.existsSync(generatedDir)) {
            return "";
        }
        if (typeof matcher === "string") {
            const candidatePath = path.join(generatedDir, matcher);
            return fs.existsSync(candidatePath) ? normalizePublicPath(candidatePath) : "";
        }
        const matches = listGeneratedAssets(matcher);
        return matches.length ? matches[matches.length - 1] : "";
    } catch (error) {
        console.error("Failed to inspect generated assets:", error);
        return "";
    }
}