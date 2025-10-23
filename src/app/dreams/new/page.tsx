"use client";

import { motion } from "framer-motion";
import DreamForm from "@/components/dream/DreamForm";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";

export default function NewDreamPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-16 text-white">
      <SpectralBackdrop className="opacity-80" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-12">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="space-y-4 text-center"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">
            Record Dream
          </p>
          <h1 className="text-4xl font-semibold text-white/90 md:text-5xl">
            Capture Your Night Signal
          </h1>
          <p className="text-sm leading-relaxed text-white/65 md:text-base">
            Describe the symbols, sensations, and emotions before they fade.
            We&apos;ll weave them into your private atlas—or share them with
            the collective if you choose.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
          className="rounded-[32px] border border-white/10 bg-white/6 p-8 backdrop-blur md:p-12"
        >
          <DreamForm />
        </motion.div>
      </div>
    </main>
  );
}
