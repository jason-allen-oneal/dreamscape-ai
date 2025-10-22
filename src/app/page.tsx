
"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [particles, setParticles] = useState<
    { top: string; left: string; width: string; height: string; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const p = Array.from({ length: 30 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 8 + 2}px`,
      height: `${Math.random() * 8 + 2}px`,
      delay: Math.random() * 5,
      duration: 12 + Math.random() * 10,
    }));
    setParticles(p);
  }, []);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-[#050218] via-[#090524] to-[#0d0a3a] text-white">
      {/* Nebula / aurora gradients */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute w-[90vw] h-[90vw] top-[-15vw] left-1/2 -translate-x-1/2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-600/30 via-indigo-700/20 to-transparent blur-[160px] animate-pulse-slowest" />
        <div className="absolute w-[70vw] h-[70vw] bottom-[-10vw] right-[-20vw] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-violet-700/10 to-transparent blur-[200px] animate-pulse-slower" />
      </div>

      {/* Floating motes */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.5, 0.1] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
            className="absolute rounded-full bg-fuchsia-400/10 blur-md"
            style={p}
          />
        ))}
      </div>

      {/* Dream title */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="text-7xl md:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-fuchsia-400 to-violet-400 drop-shadow-[0_0_25px_rgba(180,100,255,0.4)]"
      >
        Dreamscape AI
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.4 }}
        className="max-w-2xl mt-6 text-center text-lg text-gray-300 leading-relaxed"
      >
        A collective atlas of dreams — where imagination, memory, and machine intelligence merge.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.8, delay: 0.8, ease: "easeOut" }}
        className="mt-10 flex gap-6"
      >
        <a
          href="/login"
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_25px_rgba(147,51,234,0.7)] transition-all duration-300 text-lg font-medium"
        >
          Enter the Dream
        </a>
        <a
          href="/about"
          className="px-8 py-3 rounded-xl border border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-800/20 transition-all duration-300 text-lg font-medium"
        >
          Learn More
        </a>
      </motion.div>

      {/* Floating “orb” of consciousness */}
      <motion.div
        className="absolute w-64 h-64 bg-gradient-to-br from-fuchsia-500/10 to-indigo-400/5 blur-[120px] rounded-full mix-blend-screen -z-10"
        animate={{
          x: [0, 40, -40, 0],
          y: [0, 20, -20, 0],
          opacity: [0.4, 0.7, 0.5, 0.4],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </main>
  );
}
