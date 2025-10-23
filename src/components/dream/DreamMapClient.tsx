"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getEmotionTheme } from "./emotionThemes";

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

type CloudNode = DreamNode & {
  count: number;
  size: number;
  phase: number;
};

export interface DreamMapCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  empty: {
    emoji: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
  selectedLabel: string;
  selectedDescription: string;
  releaseLabel: string;
  badgeLabelSingular: string;
  badgeLabelPlural: string;
  logLabel?: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const createTagCloud = (nodes: DreamNode[]): CloudNode[] => {
  const uniqueTags = new Map<string, { node: DreamNode; count: number }>();

  nodes.forEach((node) => {
    const existing = uniqueTags.get(node.label);
    if (existing) {
      existing.count += 1;
    } else {
      uniqueTags.set(node.label, { node, count: 1 });
    }
  });

  const tagArray = Array.from(uniqueTags.values()).sort(
    (a, b) => b.count - a.count,
  );

  if (tagArray.length === 0) return [];

  const maxCount = tagArray.reduce((max, entry) => Math.max(max, entry.count), 1);
  const maxRadius = 40;
  const margin = 12;

  return tagArray.map((tagData, index) => {
    const baseRadius =
      Math.sqrt(index / Math.max(tagArray.length - 1, 1)) * maxRadius;
    const radius = baseRadius + (tagData.count / maxCount) * 6;
    const angle = index * GOLDEN_ANGLE;
    const jitterRadius = (Math.random() - 0.5) * 6;
    const jitterAngle = (Math.random() - 0.5) * 0.35;

    const r = radius + jitterRadius;
    const theta = angle + jitterAngle;

    const x = 50 + Math.cos(theta) * r;
    const y = 52 + Math.sin(theta) * r * 0.72;

    return {
      ...tagData.node,
      count: tagData.count,
      x: clamp(x, margin, 100 - margin),
      y: clamp(y, margin, 100 - margin),
      size: clamp(16 + (tagData.count / maxCount) * 18, 16, 44),
      phase: Math.random() * 3,
    } as CloudNode;
  });
};

interface SurrealDreamMapProps {
  nodes: DreamNode[];
  edges: DreamEdge[];
  copy: DreamMapCopy;
}

export function SurrealDreamMap({ nodes, edges, copy }: SurrealDreamMapProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cloudNodes = useMemo(() => createTagCloud(nodes), [nodes]);
  const nodeLookup = useMemo(
    () => new Map(cloudNodes.map((tag) => [tag.id, tag])),
    [cloudNodes],
  );
  const selectedNode = selectedTag ? nodeLookup.get(selectedTag) ?? null : null;

  const starField = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        id: `star-${i}`,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.4 + 0.2,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 6,
      })),
    [],
  );

  const dreamOrbs = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: `orb-${i}`,
        left: Math.random() * 100,
        top: Math.random() * 100,
        scale: 0.8 + Math.random(),
        duration: 14 + Math.random() * 6,
        delay: Math.random() * 5,
      })),
    [],
  );

  const handleTagClick = (tagId: string) => {
    if (selectedTag === tagId) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tagId);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative h-screen overflow-hidden text-white">
      {/* --- Base Aurora Layers -------------------------------- */}
      <div className="absolute inset-0 bg-[#050019]" />

      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(108, 64, 255, 0.55), transparent 58%)",
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 78% 30%, rgba(255, 102, 194, 0.45), transparent 60%)",
          }}
          animate={{ rotate: [0, 4, 0] }}
          transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 opacity-70 mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 120deg at 50% 50%, rgba(69, 170, 255, 0.25), rgba(184, 104, 255, 0.2), rgba(69, 170, 255, 0.25))",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* --- Halo Rings ---------------------------------------- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[320, 460, 640].map((size, idx) => (
          <motion.div
            key={`ring-${size}`}
            className="rounded-full border border-white/10 mix-blend-screen"
            style={{ width: size, height: size }}
            animate={{
              rotate: [0, idx % 2 === 0 ? 8 : -8, 0],
              opacity: [0.2, 0.35, 0.2],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 28 + idx * 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: idx * 2,
            }}
          />
        ))}
      </div>

      {/* --- Star Field ---------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none">
        {starField.map((star) => (
          <motion.span
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: 0.4,
            }}
            animate={{ opacity: [0.15, 0.6, 0.15], scale: [0.7, 1.3, 0.7] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* --- Floating Orbs ------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen">
        {dreamOrbs.map((orb) => (
          <motion.div
            key={orb.id}
            className="absolute rounded-full blur-3xl"
            style={{
              left: `${orb.left}%`,
              top: `${orb.top}%`,
              width: "18rem",
              height: "18rem",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 70%)",
            }}
            animate={{
              scale: [orb.scale, orb.scale * 1.3, orb.scale],
              opacity: [0.05, 0.12, 0.05],
              x: [0, (Math.random() - 0.5) * 40, 0],
              y: [0, (Math.random() - 0.5) * 40, 0],
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* --- Headline ------------------------------------------ */}
      <motion.header
        className="pointer-events-none absolute top-16 left-1/2 z-20 w-full max-w-3xl -translate-x-1/2 px-6 text-center md:left-16 md:translate-x-0 md:text-left"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        <span className="tracking-[0.45em] text-xs uppercase text-white/50">
          {copy.eyebrow}
        </span>
        <h1 className="mt-3 text-4xl font-semibold text-transparent md:text-6xl bg-clip-text bg-gradient-to-br from-sky-200 via-rose-200 to-violet-200">
          {copy.title}
        </h1>
        <p className="mt-4 text-sm text-white/65 md:text-base">
          {copy.subtitle}
        </p>
      </motion.header>

      {/* --- Content Layer ------------------------------------- */}
      <div className="relative z-30 flex h-full flex-col">
        {cloudNodes.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <motion.div
              className="relative max-w-xl rounded-3xl border border-white/15 bg-white/5 px-10 py-14 text-center backdrop-blur-2xl shadow-[0_40px_120px_rgba(41,14,84,0.45)]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.div
                className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-4xl"
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 12, repeat: Infinity }}
              >
                {copy.empty.emoji}
              </motion.div>
              <h2 className="text-2xl font-semibold text-white/90">
                {copy.empty.title}
              </h2>
              <p className="mt-3 text-sm text-white/65">
                {copy.empty.description}
              </p>
              <motion.a
                href={copy.empty.ctaHref}
                className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/80 transition-colors hover:bg-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                {copy.empty.ctaLabel}
              </motion.a>
            </motion.div>
          </div>
        ) : (
          <>
            {/* --- Connections ---------------------------------- */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="dream-flow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(148, 163, 255, 0.2)" />
                  <stop offset="45%" stopColor="rgba(244, 114, 182, 0.35)" />
                  <stop offset="100%" stopColor="rgba(96, 165, 250, 0.25)" />
                </linearGradient>
              </defs>
              {edges.map((edge, index) => {
                const from = nodeLookup.get(edge.from);
                const to = nodeLookup.get(edge.to);

                if (!from || !to) return null;

                const isActive =
                  hoveredTag === from.id || hoveredTag === to.id || selectedTag === from.id || selectedTag === to.id;

                return (
                  <motion.line
                    key={`${edge.from}-${edge.to}-${index}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="url(#dream-flow)"
                    strokeWidth={0.3 + edge.weight * 0.9 + (isActive ? 0.5 : 0)}
                    strokeLinecap="round"
                    opacity={isActive ? 0.8 : 0.35}
                    style={{
                      filter: isActive
                        ? "drop-shadow(0 0 12px rgba(255,255,255,0.35))"
                        : "drop-shadow(0 0 6px rgba(94,234,212,0.15))",
                    }}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 1.8,
                      delay: index * 0.05,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </svg>

            {/* --- Tags ---------------------------------------- */}
            {cloudNodes.map((tag, index) => {
              const isSelected = selectedTag === tag.id;
              const isHovered = hoveredTag === tag.id;
              const theme = getEmotionTheme(tag.emotion);

              return (
                <motion.div
                  key={tag.id}
                  className="absolute cursor-pointer select-none"
                  style={{
                    left: `${tag.x}%`,
                    top: `${tag.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                  animate={
                    isSelected || isHovered
                      ? { opacity: 1, scale: 1.16, rotate: 0, y: 0 }
                      : {
                          opacity: [0.55, 1, 0.55],
                          scale: [0.82, 1.03, 0.82],
                          rotate: [-6, 6, -6],
                          y: [-3, 3, -3],
                        }
                  }
                  transition={
                    isSelected || isHovered
                      ? { duration: 0.35, ease: "easeOut" }
                      : {
                          duration: 6 + index * 0.05,
                          repeat: Infinity,
                          repeatType: "mirror",
                          ease: "easeInOut",
                          delay: tag.phase,
                        }
                  }
                  onClick={() => handleTagClick(tag.id)}
                  onMouseEnter={() => setHoveredTag(tag.id)}
                  onMouseLeave={() => setHoveredTag((prev) => (prev === tag.id ? null : prev))}
                >
                  <motion.div
                    className={`
                      relative overflow-hidden rounded-full border border-white/20
                      bg-gradient-to-r ${theme.gradient} ${theme.glow}
                      px-4 py-1.5 text-white shadow-lg backdrop-blur-2xl
                      ${isSelected ? "ring-4 ring-white/30" : "ring-1 ring-white/10"}
                    `}
                    style={{ fontSize: `${tag.size}px` }}
                    whileHover={{ boxShadow: "0 0 36px rgba(255,255,255,0.35)" }}
                  >
                    <motion.span
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 3.2,
                        repeat: Infinity,
                        repeatDelay: 4 + Math.random() * 2,
                      }}
                    />
                    <span className="relative z-10 whitespace-nowrap">
                      {tag.label}
                      {tag.count > 1 && (
                        <span className="ml-2 text-xs text-white/75">
                          ({tag.count})
                        </span>
                      )}
                    </span>
                  </motion.div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* --- Selected Info ------------------------------------- */}
      {selectedNode && (
        <motion.aside
          className="absolute bottom-12 left-1/2 z-40 w-[min(90vw,420px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-white/85 backdrop-blur-2xl shadow-[0_40px_120px_rgba(45,20,96,0.55)] md:left-12 md:translate-x-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                {copy.selectedLabel}
              </p>
              <h3
                className={`mt-2 text-2xl font-semibold ${getEmotionTheme(selectedNode.emotion).text}`}
              >
                {selectedNode.label}
              </h3>
            </div>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
              {selectedNode.count}{" "}
              {selectedNode.count === 1
                ? copy.badgeLabelSingular
                : copy.badgeLabelPlural}
            </span>
          </div>
          <p className="mt-4 text-sm text-white/70">
            {copy.selectedDescription}
          </p>
          <button
            onClick={() => setSelectedTag(null)}
            className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:text-white"
          >
            {copy.releaseLabel}
          </button>
        </motion.aside>
      )}
    </div>
  );
}

const PERSONAL_COPY: DreamMapCopy = {
  eyebrow: "Dream Atlas",
  title: "Hypnagogic Field",
  subtitle:
    "Drift through the surreal cartography of your subconscious and watch motifs shimmer into constellations.",
  empty: {
    emoji: "🌌",
    title: "No echoes yet",
    description:
      "Record your first dream and watch it ripple into luminous currents that guide the rest of your subconscious journey.",
    ctaLabel: "Enter the realm",
    ctaHref: "/dreams/new",
  },
  selectedLabel: "Recurring motif",
  selectedDescription:
    "Follow the luminous strands to revisit every tale woven with this symbol. Click again to release the motif back into the stream.",
  releaseLabel: "Release motif",
  badgeLabelSingular: "Dream",
  badgeLabelPlural: "Dreams",
  logLabel: "personal tag",
};

export default function DreamMapClient({
  nodes,
  edges,
}: {
  nodes: DreamNode[];
  edges: DreamEdge[];
}) {
  return <SurrealDreamMap nodes={nodes} edges={edges} copy={PERSONAL_COPY} />;
}
