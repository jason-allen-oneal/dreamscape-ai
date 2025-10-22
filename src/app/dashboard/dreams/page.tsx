"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardDreamsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dreams, setDreams] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch("/api/dreams")
      .then((res) => res.json())
      .then((data) => setDreams(data || []));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#060318] via-[#0a0626] to-[#0e0a3a] text-white px-6 py-12">
      
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1 }}
        className="flex flex-wrap justify-center gap-4 mb-10 z-10"
      >
        <button
          onClick={() => router.push("/dreams/new")}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 font-semibold shadow-[0_0_10px_rgba(147,51,234,0.4)] transition-all"
        >
          + Record Dream
        </button>
        <button
          onClick={() => router.push("/dashboard/dreams/map")}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 font-semibold shadow-[0_0_10px_rgba(79,70,229,0.4)] transition-all"
        >
          🪐 Dream Atlas
        </button>
      </motion.div>

      {/* Dream Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
        className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl z-10"
      >
        {dreams.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full">
            No dreams yet. Start recording one.
          </p>
        ) : (
          dreams.map((d, i) => (
            <motion.div
              key={d.id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 20px rgba(147,51,234,0.4)",
              }}
              className="bg-slate-900/50 p-5 rounded-xl border border-slate-700 backdrop-blur-xl cursor-pointer hover:border-fuchsia-500/40 transition-all"
              onClick={() => router.push(`/dreams/${d.id}`)}
            >
              <h2 className="text-lg font-semibold mb-1 text-fuchsia-300">
                {d.summary || "Untitled Dream"}
              </h2>
              <p className="text-xs text-gray-400 mb-2">
                {new Date(d.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-300 line-clamp-3">{d.rawText}</p>
              <p className="text-xs mt-2 text-fuchsia-400">
                Emotion: {d.emotion || "Unknown"}
              </p>
            </motion.div>
          ))
        )}
      </motion.div>
    </main>
  );
}
