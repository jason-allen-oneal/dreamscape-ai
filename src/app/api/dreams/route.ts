// src/app/api/dreams/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    const dreams = await prisma.dream.findMany({
      where,
      orderBy,
      include: {
        mediaItems: true,
        tags: { include: { tagDictionary: true } },
      },
    });

    return NextResponse.json(dreams);
  } catch (error: unknown) {
    console.error("Failed to fetch dreams:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch dreams";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
