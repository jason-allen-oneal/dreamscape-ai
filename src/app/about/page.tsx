// src/app/about/page.tsx

"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  const [motes, setMotes] = useState<
    { top: string; left: string; w: number; h: number }[]
  >([]);

  useEffect(() => {
    setMounted(true);
    const newMotes = Array.from({ length: 20 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      w: Math.random() * 8 + 2,
      h: Math.random() * 8 + 2,
    }));
    setMotes(newMotes);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#060318] via-[#0a0626] to-[#0e0a3a] text-white relative overflow-hidden px-6">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute w-[90vw] h-[90vw] top-[-10vw] left-1/2 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-600/30 via-indigo-800/20 to-transparent blur-[160px] animate-pulse-slowest" />
        <div className="absolute w-[70vw] h-[70vw] bottom-[-20vw] right-1/2 translate-x-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-700/20 via-violet-800/10 to-transparent blur-[200px] animate-pulse-slower" />
      </div>

      {/* Floating motes */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {motes.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 12,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-fuchsia-400/10 blur-md"
            style={{
              top: m.top,
              left: m.left,
              width: `${m.w}px`,
              height: `${m.h}px`,
            }}
          />
        ))}
      </div>

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="bg-slate-900/50 p-10 rounded-2xl border border-slate-700 shadow-lg backdrop-blur-xl w-full max-w-2xl relative z-10"
      >
        <h1 className="text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-violet-400">
          About Dreamscape AI
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="text-gray-300 leading-relaxed text-lg text-center"
        >
          Dreamscape AI is a collective experiment in mapping the subconscious.
          Every dream you share contributes to a living atlas of symbols,
          sensations, and stories — a fusion of memory, myth, and machine.
          Your privacy is sacred: you decide whether to keep your dreams
          personal or merge them into the shared collective consciousness.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1.2 }}
          className="mt-6 text-gray-400 text-center text-sm"
        >
          This project is part art, part science — an ongoing experiment in
          decoding the architecture of dreams.
        </motion.p>
      </motion.div>
    </main>
  );
}
