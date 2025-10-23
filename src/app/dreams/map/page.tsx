import prisma from "@/lib/prisma";
import GlobalDreamMapClient, { DreamNode, DreamEdge } from "@/components/dream/GlobalDreamMapClient";

// ─── SERVER FETCH ─────────────────────────────────────────────
async function getGlobalDreamGraph() {
  const dreams = await prisma.dream.findMany({
    where: { visibility: { in: ["WORLD", "SHARED"] } },
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
          emotion: dream.emotion as string,
        });
      }
      tag.edgesFrom.forEach((edge) => {
        edges.push({ from: tag.id, to: edge.toTagId, weight: edge.weight });
      });
    });
  });

  return { nodes: Array.from(nodesMap.values()), edges };
}

// ─── SERVER COMPONENT PAGE ─────────────────────────────────────
export default async function GlobalDreamMapPage() {
  const { nodes, edges } = await getGlobalDreamGraph();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030014] text-white">
      <GlobalDreamMapClient nodes={nodes} edges={edges} />
    </main>
  );
}
