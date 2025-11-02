// src/app/api/dreams/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    // Pass headers to getServerSession for Next.js App Router
    const session = await getServerSession(authOptions);
    
    console.log("[API /dreams] Session check:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });
    
    if (!session?.user?.id) {
      console.error("[API /dreams] Unauthorized - no session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params for sorting/filtering
    const url = new URL(req.url);
    const sortBy = url.searchParams.get("sort") || "createdAt";
    const filterTag = url.searchParams.get("tag");

    const orderBy: Prisma.DreamOrderByWithRelationInput =
      sortBy === "recent"
        ? { createdAt: "desc" }
        : sortBy === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };

    const where: Prisma.DreamWhereInput = {
      userId: session.user.id,
      ...(filterTag
        ? {
            tags: {
              some: { tagDictionary: { value: filterTag } },
            },
          }
        : {}),
    };

    console.log("[API /dreams] Fetching dreams for userId:", session.user.id);
    console.log("[API /dreams] User info:", {
      id: session.user.id,
      name: session.user.name,
    });

    // Debug: Check if there are any dreams in the database
    const totalDreams = await prisma.dream.count();
    const userDreams = await prisma.dream.count({
      where: { userId: session.user.id },
    });
    console.log("[API /dreams] Debug counts:", {
      totalDreamsInDb: totalDreams,
      dreamsForThisUser: userDreams,
      loggedInUserId: session.user.id,
    });

    const dreams = await prisma.dream.findMany({
      where,
      orderBy,
      include: {
        mediaItems: true,
        tags: { include: { tagDictionary: true } },
      },
    });

    console.log(`[API /dreams] Found ${dreams.length} dreams`);

    return NextResponse.json(dreams);
  } catch (error: unknown) {
    console.error("[API /dreams] Failed to fetch dreams:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch dreams";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
