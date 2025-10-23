"use client";

import { motion } from "framer-motion";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";

const pillars = [
  {
    title: "Collective cartography",
    description:
      "Each shared dream becomes a luminous node. We surface recurring motifs and emotions to map the subconscious terrain we traverse together.",
    icon: "✶",
  },
  {
    title: "Ethical guardianship",
    description:
      "Dreams are sacred memories. You decide who can access them, and you can withdraw them from the constellation at any time.",
    icon: "🜂",
  },
  {
    title: "Generative reflection",
    description:
      "Machine intelligence refracts your visions into reflections, prompts, and visual companions that invite deeper interpretation.",
    icon: "🜁",
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <SpectralBackdrop className="opacity-75" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-16 px-6 py-20 md:py-28">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mx-auto max-w-3xl text-center space-y-6"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">
            About Dreamscape
          </p>
          <h1 className="text-4xl font-semibold text-white/90 md:text-6xl">
            A Living Atlas of the Subconscious
          </h1>
          <p className="text-base leading-relaxed text-white/65">
            Dreamscape AI is part ritual, part research lab. We invite dreamers
            to chronicle their night worlds and watch as patterns bloom across
            cultures, histories, and emotional spectra.
          </p>
        </motion.header>

        <section className="grid gap-8 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              className="flex flex-col gap-4 rounded-3xl border border-white/12 bg-white/6 px-6 py-8 backdrop-blur"
            >
              <span className="text-2xl text-white/60">{pillar.icon}</span>
              <h2 className="text-lg font-semibold text-white/85 uppercase tracking-[0.2em]">
                {pillar.title}
              </h2>
              <p className="text-sm leading-relaxed text-white/70">
                {pillar.description}
              </p>
            </motion.article>
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-white/70 backdrop-blur"
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/45">
                Why dreams matter
              </h3>
              <p className="text-sm leading-relaxed">
                Dreams encode emotional processing, pattern recognition, and
                myth-making in real time. By weaving them together, we glimpse
                emergent archetypes that shape collective futures.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/45">
                What we build next
              </h3>
              <p className="text-sm leading-relaxed">
                Upcoming experiments include guided dream circles, visual
                synthesis from recurring symbols, and integrations with mindful
                sleep rituals.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
