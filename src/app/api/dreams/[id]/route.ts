// src/app/api/dreams/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DreamVisibility } from "@prisma/client";

interface Params {
  id: string;
}

const isDreamVisibility = (value: unknown): value is DreamVisibility =>
  typeof value === "string" &&
  Object.values(DreamVisibility).includes(value as DreamVisibility);

interface UpdateDreamPayload {
  summary?: unknown;
  rawText?: unknown;
  visibility?: unknown;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dream = await prisma.dream.findUnique({
      where: { id: params.id },
      include: {
        mediaItems: true,
        tags: { include: { tagDictionary: true } },
      },
    });

    if (!dream || dream.userId !== session.user.id) {
      return NextResponse.json({ error: "Dream not found" }, { status: 404 });
    }

    return NextResponse.json(dream);
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch dream";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as UpdateDreamPayload;

    const dream = await prisma.dream.findUnique({ where: { id: params.id } });
    if (!dream || dream.userId !== session.user.id) {
      return NextResponse.json({ error: "Dream not found" }, { status: 404 });
    }

    const summary =
      typeof body.summary === "string" ? body.summary : dream.summary;
    const rawText =
      typeof body.rawText === "string" ? body.rawText : dream.rawText;
    const visibility = isDreamVisibility(body.visibility)
      ? body.visibility
      : dream.visibility;

    const updatedDream = await prisma.dream.update({
      where: { id: params.id },
      data: {
        summary,
        rawText,
        visibility,
      },
    });

    return NextResponse.json(updatedDream);
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to update dream";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dream = await prisma.dream.findUnique({ where: { id: params.id } });
    if (!dream || dream.userId !== session.user.id) {
      return NextResponse.json({ error: "Dream not found" }, { status: 404 });
    }

    // Delete related media and tags first (optional, Prisma can cascade if configured)
    await prisma.media.deleteMany({ where: { dreamId: params.id } });
    await prisma.dreamTag.deleteMany({ where: { dreamId: params.id } });

    await prisma.dream.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Dream deleted successfully" });
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to delete dream";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
