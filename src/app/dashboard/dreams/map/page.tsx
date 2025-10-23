// ─── SERVER COMPONENT / PAGE ─────────────────────────────────────────
import prisma from "@/lib/prisma";
import DreamMapClient from "@/components/dream/DreamMapClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface DreamNode {
  id: string;
  x: number;
  y: number;
  label: string;
  emotion?: string;
}

interface DreamEdge {
  from: string;
  to: string;
  weight: number;
}

// ─── SERVER FETCH ─────────────────────────────────────────────
async function fetchDreamGraph(userId: string) {
  // fetch all dreams for this user
  const dreams = await prisma.dream.findMany({
    where: { 
      OR: [
        { userId },                       // user's own dreams
        { visibility: { in: ["WORLD"] } } // global/world dreams
      ]
    },
    include: {
      tags: {
        include: {
          tagDictionary: true,
          edgesFrom: { include: { toTag: { include: { tagDictionary: true } } } },
        },
      },
    },
  });

  const nodesMap = new Map<string, DreamNode>();
  const edges: DreamEdge[] = [];

  dreams.forEach((dream) => {
    dream.tags.forEach((tag) => {
      if (!nodesMap.has(tag.id)) {
        nodesMap.set(tag.id, {
          id: tag.id,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          label: tag.tagDictionary.value,
          emotion: dream.emotion ?? undefined,
        });
      }
      tag.edgesFrom.forEach((edge) => {
        edges.push({
          from: tag.id,
          to: edge.toTagId,
          weight: edge.weight ?? 0,
        });
      });
    });
  });

  return { nodes: Array.from(nodesMap.values()), edges };
}

// ─── SERVER PAGE ─────────────────────────────────────────────
export default async function DreamMapPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        <p>Please log in to view your dream map.</p>
      </main>
    );
  }

  const { nodes, edges } = await fetchDreamGraph(session.user.id);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030014] text-white">
      <DreamMapClient nodes={nodes} edges={edges} />
    </main>
  );
}
