// src/app/api/dreams/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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

    const order: any = {};
    if (sortBy === "recent") order.createdAt = "desc";
    else if (sortBy === "oldest") order.createdAt = "asc";
    // default is createdAt descending
    else order.createdAt = "desc";

    // Build query
    const where: any = { userId: session.user.id };
    if (filterTag) {
      where.tags = { some: { tagDictionary: { value: filterTag } } };
    }

    const dreams = await prisma.dream.findMany({
      where,
      orderBy: order,
      include: {
        mediaItems: true,
        tags: { include: { tagDictionary: true } },
      },
    });

    return NextResponse.json(dreams);
  } catch (err: any) {
    console.error("Failed to fetch dreams:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch dreams" }, { status: 500 });
  }
}
