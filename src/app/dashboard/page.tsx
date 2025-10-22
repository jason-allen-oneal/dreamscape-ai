
"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dreams, setDreams] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    // Fetch dreams from the API
    fetch("/api/dreams")
      .then(res => res.json())
      .then(data => setDreams(data || []))
      .catch(err => console.error("Failed to fetch dreams:", err));
  }, []);

  // Compute stats
  const totalDreams = dreams.length;

  const lastDreamDate =
    dreams.length > 0
      ? new Date(dreams[0].createdAt).toLocaleDateString()
      : "—";

  // Most common emotion
  const emotionCounts: Record<string, number> = {};
  dreams.forEach(d => {
    const e = d.emotion || "Unknown";
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  });
  const mostCommonEmotion =
    Object.keys(emotionCounts).sort(
      (a, b) => (emotionCounts[b] || 0) - (emotionCounts[a] || 0)
    )[0] || "Neutral";

  // Common theme placeholder (requires tag parsing)
  const commonTheme = "—";

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#060318] via-[#0a0626] to-[#0e0a3a] text-white relative overflow-hidden px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1 }}
        className="relative z-10 text-center mb-10"
      >
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-violet-400 mb-2">
          Your Dream Dashboard
        </h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Quick stats and actions for your dream collection.
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-4 mb-10 z-10"
      >
        <button
          onClick={() => router.push("/dreams/new")}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-indigo-700 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-indigo-600 font-semibold shadow-[0_0_10px_rgba(147,51,234,0.4)] transition-all"
        >
          + Record Dream
        </button>
        <button
          onClick={() => router.push("/dashboard/dreams/map")}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-700 via-indigo-400 to-fuchsia-500 hover:from-indigo-600 hover:via-indigo-300 hover:to-fuchsia-400 font-semibold shadow-[0_0_10px_rgba(79,70,229,0.4)] transition-all"
        >
          🪐 Dream Atlas
        </button>
        <button
          onClick={() => router.push("/dashboard/dreams")}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 via-blue-500 to-teal-500 hover:from-fuchsia-400 hover:via-green-400 hover:to-teal-400 font-semibold shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-all"
        >
          🌙 My Dreams
        </button>
      </motion.div>

      {/* Analytics Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, delay: 0.6 }}
        className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-16 w-full max-w-6xl z-10"
      >
        {[
          { label: "Total Dreams", value: totalDreams },
          { label: "Avg. Emotion", value: mostCommonEmotion },
          { label: "Common Theme", value: commonTheme },
          { label: "Last Dream", value: lastDreamDate },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-center backdrop-blur-lg"
          >
            <h3 className="text-fuchsia-400 text-sm uppercase mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
