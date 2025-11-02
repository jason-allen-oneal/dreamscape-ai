// Client-safe utilities that don't use Node.js modules

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

export interface WorldAssetSnapshot {
  background?: string;
  floating1?: string;
  floating2?: string;
  video?: string;
  music?: string;
}

export function normalizeUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url.replace(/^\/+/, "")}`;
}
