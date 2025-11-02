// src/app/api/world/status/route.ts
import { NextResponse } from "next/server";
import { getLastAssets, getLastDescription, getLastGeneration } from "@/lib/utils";

export async function GET() {
    try {
        const lastGenerated = await getLastGeneration();
        const lastDescription = await getLastDescription();
        const lastAssets = await getLastAssets();

        return NextResponse.json({
            lastGenerated,
            lastDescription,
            lastAssets,
        });
    } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to synthesize dream world";
          console.error(err);
          return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
      
