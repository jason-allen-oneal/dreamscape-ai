"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";
import { Button } from "@/components/ui/Button";

interface Dream {
  id: string;
  createdAt: string;
  emotion?: string | null;
  tags?: { tagDictionary: { value: string } }[];
}

const toolbarActions = [
  {
    label: "Record Dream",
    href: "/dreams/new",
  },
  {
    label: "Dream Atlas",
    href: "/dashboard/dreams/map",
  },
  {
    label: "My Dreams",
    href: "/dashboard/dreams",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [dreams, setDreams] = useState<Dream[]>([]);

  useEffect(() => {
    fetch("/api/dreams")
      .then((response) => response.json())
      .then((data) => setDreams(data || []))
      .catch(() => setDreams([]));
  }, []);

  const stats = useMemo(() => {
    if (dreams.length === 0) {
      return {
        totalDreams: 0,
        lastDreamDate: "—",
        mostCommonEmotion: "—",
        recurringMotif: "—",
      };
    }

    const lastDreamDate = new Date(dreams[0].createdAt).toLocaleDateString();
    const emotionCounts: Record<string, number> = {};
    const motifCounts: Record<string, number> = {};

    dreams.forEach((dream) => {
      const emotionKey = dream.emotion?.toLowerCase() || "unknown";
      emotionCounts[emotionKey] = (emotionCounts[emotionKey] || 0) + 1;

      dream.tags?.forEach((tag) => {
        const value = tag.tagDictionary.value;
        motifCounts[value] = (motifCounts[value] || 0) + 1;
      });
    });

    const mostCommonEmotion =
      Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const recurringMotif =
      Object.entries(motifCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return {
      totalDreams: dreams.length,
      lastDreamDate,
      mostCommonEmotion,
      recurringMotif,
    };
  }, [dreams]);

  return (
    <main className="relative min-h-screen overflow-x-hidden px-6 py-16 text-white">
      <SpectralBackdrop className="opacity-75" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="space-y-5 text-center md:text-left"
        >
          <p className="text-xs uppercase tracking-[0.45em] text-white/40">
            Dreamer Console
          </p>
          <h1 className="text-4xl font-semibold text-white/90 md:text-5xl">
            Navigate Your Subconscious Archive
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
            Monitor the pulse of your dream life, revisit recurring motifs, and
            dive back into the atlas whenever inspiration strikes.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 md:justify-start"
        >
          {toolbarActions.map((action) => (
            <Button
              key={action.href}
              type="button"
              size="lg"
              onClick={() => router.push(action.href)}
            >
              {action.label}
            </Button>
          ))}
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {[
            { label: "Dreams captured", value: stats.totalDreams },
            { label: "Recurring motif", value: stats.recurringMotif },
            { label: "Dominant tone", value: stats.mostCommonEmotion },
            { label: "Last entry", value: stats.lastDreamDate },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-3xl border border-white/12 bg-white/6 px-6 py-6 text-white/70 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                {stat.label}
              </p>
              <p className="mt-4 text-2xl font-semibold text-white/90">
                {stat.value}
              </p>
            </article>
          ))}
        </motion.section>
      </div>
    </main>
  );
}
