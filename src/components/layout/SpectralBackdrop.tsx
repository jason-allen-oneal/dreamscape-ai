"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface SpectralBackdropProps {
  className?: string;
  density?: number;
  hue?: "indigo" | "violet" | "emerald" | "rose";
}

type Star = {
  id: string;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
};

type Orb = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  duration: number;
  delay: number;
  offsetX: number;
  offsetY: number;
};

const HUE_MAP = {
  indigo: {
    primary: "rgba(99,102,241,0.35)",
    secondary: "rgba(225,29,72,0.3)",
    accent: "rgba(6,182,212,0.28)",
  },
  violet: {
    primary: "rgba(168,85,247,0.35)",
    secondary: "rgba(236,72,153,0.28)",
    accent: "rgba(129,140,248,0.3)",
  },
  emerald: {
    primary: "rgba(16,185,129,0.32)",
    secondary: "rgba(56,189,248,0.28)",
    accent: "rgba(244,114,182,0.28)",
  },
  rose: {
    primary: "rgba(244,114,182,0.4)",
    secondary: "rgba(96,165,250,0.28)",
    accent: "rgba(192,132,252,0.28)",
  },
} as const;

function createSeededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;

  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function SpectralBackdrop({
  className,
  density = 120,
  hue = "violet",
}: SpectralBackdropProps) {
  const colors = HUE_MAP[hue];

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: density }).map((_, index) => {
        const random = createSeededRandom(`star-${density}-${hue}-${index}`);
        return {
          id: `star-${index}`,
          left: random() * 100,
          top: random() * 100,
          size: random() * 1.4 + 0.4,
          duration: 8 + random() * 12,
          delay: random() * 12,
        };
      }),
    [density, hue],
  );

  const orbs = useMemo<Orb[]>(
    () =>
      Array.from({ length: 8 }).map((_, index) => {
        const random = createSeededRandom(`orb-${density}-${hue}-${index}`);
        return {
          id: `orb-${index}`,
          left: random() * 100,
          top: random() * 100,
          width: 16 + random() * 12,
          height: 16 + random() * 12,
          duration: 18 + random() * 8,
          delay: random() * 12,
          offsetX: (random() - 0.5) * 40,
          offsetY: (random() - 0.5) * 40,
        };
      }),
    [density, hue],
  );

  return (
    <div
      className={clsx(
        "absolute inset-0 -z-10 overflow-hidden bg-[#030014]",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-90">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 18% 24%, rgba(99,102,241,0.25), transparent 55%)",
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 78% 14%, rgba(236,72,153,0.25), transparent 60%)",
          }}
          animate={{ rotate: [0, 4, 0] }}
          transition={{ duration: 48, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, rgba(14,165,233,0.18), rgba(129,140,248,0.18), rgba(244,114,182,0.16), rgba(14,165,233,0.18))",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="absolute inset-[10%] rounded-full border border-white/5 opacity-40 blur-[80px]" />

      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <motion.span
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: 0.55,
            }}
            animate={{
              opacity: [0.15, 0.6, 0.2],
              scale: [0.7, 1.2, 0.8],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {orbs.map((orb) => (
          <motion.div
            key={orb.id}
            className="absolute rounded-full blur-3xl mix-blend-screen"
            style={{
              left: `${orb.left}%`,
              top: `${orb.top}%`,
              width: `${orb.width}rem`,
              height: `${orb.height}rem`,
              background: `radial-gradient(circle at 30% 30%, ${colors.primary}, transparent 70%)`,
            }}
            animate={{
              opacity: [0.05, 0.16, 0.05],
              scale: [0.8, 1.2, 0.8],
              x: [0, orb.offsetX, 0],
              y: [0, orb.offsetY, 0],
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
    </div>
  );
}
