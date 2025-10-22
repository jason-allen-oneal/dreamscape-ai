// src/app/api/dreams/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface Params {
  id: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
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
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to fetch dream" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { summary, rawText, visibility } = body;

    const dream = await prisma.dream.findUnique({ where: { id: params.id } });
    if (!dream || dream.userId !== session.user.id) {
      return NextResponse.json({ error: "Dream not found" }, { status: 404 });
    }

    const updatedDream = await prisma.dream.update({
      where: { id: params.id },
      data: {
        summary: summary ?? dream.summary,
        rawText: rawText ?? dream.rawText,
        visibility: visibility ?? dream.visibility,
      },
    });

    return NextResponse.json(updatedDream);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to update dream" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
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
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to delete dream" }, { status: 500 });
  }
}
