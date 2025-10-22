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