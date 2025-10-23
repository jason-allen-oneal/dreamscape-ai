// --- CLIENT COMPONENT -------------------------------------------------
"use client";

import { SurrealDreamMap, DreamMapCopy } from "./DreamMapClient";

export interface DreamNode {
  id: string;
  x: number;
  y: number;
  label: string;
  emotion?: string;
}

export interface DreamEdge {
  from: string;
  to: string;
  weight: number;
}

const GLOBAL_COPY: DreamMapCopy = {
  eyebrow: "Collective Atlas",
  title: "Oneiric Confluence",
  subtitle:
    "Witness humanity's tangled sleep as shared archetypes shimmer through the void and entwine distant dreamers.",
  empty: {
    emoji: "🛸",
    title: "The collective unconscious slumbers",
    description:
      "No shared dreams have surfaced yet. When someone offers their vision to the world, the nebula will bloom with interwoven stories.",
    ctaLabel: "Share your first dream",
    ctaHref: "/dreams/new",
  },
  selectedLabel: "Shared motif",
  selectedDescription:
    "These threads pulse where different dreamers overlap. Dive through the luminous lattice to explore how their visions resonate.",
  releaseLabel: "Release constellation",
  badgeLabelSingular: "Dream",
  badgeLabelPlural: "Dreams",
  logLabel: "collective tag",
};

export default function GlobalDreamMapClient({
  nodes,
  edges,
}: {
  nodes: DreamNode[];
  edges: DreamEdge[];
}) {
  return <SurrealDreamMap nodes={nodes} edges={edges} copy={GLOBAL_COPY} />;
}
