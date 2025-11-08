// Client-safe utilities that can be imported by both client and server components

export function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function normalizeUrl(url: string): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return url;
    return `/${url.replace(/^\/+/, "")}`;
}
