"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";
import { Button } from "@/components/ui/Button";
import { Dream, Media, DreamTag, TagDictionary } from "@prisma/client";

type DreamWithRelations = Dream & {
  mediaItems?: Media[];
  tags?: (DreamTag & { tagDictionary: TagDictionary })[];
  intensity?: number | null;
};

export default function DashboardDreamsPage() {
  const router = useRouter();
  const [dreams, setDreams] = useState<DreamWithRelations[]>([]);

  useEffect(() => {
    fetch("/api/dreams")
      .then((response) => response.json())
      .then((data) => setDreams(data || []))
      .catch(() => setDreams([]));
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden px-6 py-16 text-white">
      <SpectralBackdrop className="opacity-75" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">
              Personal archive
            </p>
            <h1 className="text-4xl font-semibold text-white/90">
              Your Dream Ledger
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/65">
              Revisit every recorded vision, follow threads of emotion, and dive
              back into the details with a single click.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" size="lg" onClick={() => router.push("/dreams/new")}>
              Record Dream
            </Button>
            <Button
              type="button"
              size="lg"
              intent="secondary"
              onClick={() => router.push("/dashboard/dreams/map")}
            >
              View Atlas
            </Button>
          </div>
        </header>

        {dreams.length === 0 ? (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-white/12 bg-white/6 px-10 py-16 text-center backdrop-blur">
            <span className="text-4xl">☾</span>
            <h2 className="text-2xl font-semibold text-white/85">No entries yet</h2>
            <p className="text-sm text-white/65">
              Your subconscious ledger is quiet. Record the next dream you recall
              and it will shimmer into this archive.
            </p>
            <button
              onClick={() => router.push("/dreams/new")}
              className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-white/35 hover:bg-white/15"
            >
              Start recording
            </button>
          </div>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {dreams.map((dream, index) => {
              const intensity =
                typeof dream.intensity === "number"
                  ? Math.round(dream.intensity * 100)
                  : null;

              return (
              <motion.button
                key={dream.id}
                type="button"
                onClick={() => router.push(`/dreams/${dream.id}`)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.06 }}
                className="group h-full rounded-3xl border border-white/12 bg-white/6 px-6 py-6 text-left text-white/75 backdrop-blur transition hover:border-white/35 hover:bg-white/10"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/45">
                  <span>{new Date(dream.createdAt).toLocaleDateString()}</span>
                <span>{dream.emotion?.toLowerCase() ?? "unknown"}</span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white/90">
                {dream.summary || "Untitled Dream"}
              </h2>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-white/70">
                {dream.rawText}
              </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/45">
                  {intensity !== null && (
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/70">
                      {intensity}% intensity
                    </span>
                  )}
                  {dream.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-white/60"
                    >
                      #{tag.tagDictionary.value}
                    </span>
                  ))}
                  {dream.tags && dream.tags.length > 3 && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/50">
                      +{dream.tags.length - 3}
                    </span>
                  )}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/45">
                  View details
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </motion.button>
            );
            })}
          </motion.section>
        )}
      </div>
    </main>
  );
}
