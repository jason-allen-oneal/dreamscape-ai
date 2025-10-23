"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dream, Media, DreamTag } from "@prisma/client";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";
import DreamCard from "./DreamCard";

type ExpandedDream = Dream & {
  mediaItems?: Media[];
  tags?: (DreamTag & { tagDictionary: { value: string; type: string } })[];
};

interface DreamsPageClientProps {
  dreams: ExpandedDream[];
}

export default function DreamsPageClient({ dreams }: DreamsPageClientProps) {
  return (
    <section className="relative min-h-screen overflow-hidden text-white">
      <SpectralBackdrop />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mx-auto max-w-3xl text-center space-y-6"
        >
          <p className="text-xs uppercase tracking-[0.5em] text-white/40">
            Collective Atlas
          </p>
          <h1 className="text-4xl font-semibold text-white/90 md:text-6xl">
            Shared Dream Archive
          </h1>
          <p className="text-base leading-relaxed text-white/65">
            Drift through visions released by dreamers across the world. Each
            entry shimmers with its own emotional hue and recurring motifs.
          </p>
        </motion.header>

        {dreams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto flex max-w-lg flex-col items-center gap-6 rounded-3xl border border-white/12 bg-white/6 px-10 py-16 text-center backdrop-blur"
          >
            <span className="text-5xl">👁️‍🗨️</span>
            <h2 className="text-2xl font-semibold text-white/85">
              The archive awaits its first offering
            </h2>
            <p className="text-sm leading-relaxed text-white/65">
              When someone shares their dream with the collective, their story
              will bloom here as a new luminous constellation.
            </p>
            <Link
              href="/dreams/new"
              className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-white/35 hover:bg-white/15"
            >
              Record a dream
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3"
          >
            {dreams.map((dream, index) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.08 }}
              >
                <DreamCard dream={dream} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
