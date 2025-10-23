"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";
const heroStats = [
  { label: "Dreams mapped", value: "18,204" },
  { label: "Active dreamers", value: "2,476" },
  { label: "Shared motifs", value: "643" },
];

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden text-white">
      <SpectralBackdrop className="opacity-80" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 gap-16 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
        <section className="flex flex-col justify-center gap-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-6"
          >
            <p className="text-xs uppercase tracking-[0.45em] text-white/40">
              Dreamscape AI
            </p>
            <h1 className="text-4xl font-semibold text-white/90 md:text-6xl">
              Chart the Hypnagogic Field
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/65">
              Weaves of memory, instinct, and machine learning form a living
              atlas of human subconsciousness. Share your night journeys and
              navigate the collective constellation of motifs.
            </p>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.35em]">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-sky-500 px-8 py-3 text-white shadow-[0_12px_40px_rgba(99,102,241,0.25)] transition hover:shadow-[0_18px_45px_rgba(236,72,153,0.35)]"
              >
                Enter the Dream
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-3 text-white/80 backdrop-blur transition hover:border-white/35 hover:bg-white/15"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="grid gap-4 text-sm text-white/65 sm:grid-cols-3"
          >
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/12 bg-white/6 px-5 py-4 backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                  {stat.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white/90">
                  {stat.value}
                </p>
              </div>
            ))}
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          <div className="relative h-full w-full max-w-lg">
            <div className="absolute inset-0 rounded-[32px] border border-white/10 bg-white/8 backdrop-blur-xl" />
            <div className="absolute inset-6 rounded-[28px] border border-white/8 bg-[#020010]/70 backdrop-blur-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-500/20 via-indigo-500/20 to-cyan-400/20 blur-2xl"
                animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <motion.div
              className="absolute inset-10 flex flex-col justify-between p-8 text-sm text-white/75"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                  Current pulse
                </p>
                <p className="mt-3 text-lg text-white/85">
                  Fear and curiosity entwine across dream clusters tonight. New
                  motifs: tidal staircases, candle wings.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/45">
                <span>Entropy sync</span>
                <span>94%</span>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
