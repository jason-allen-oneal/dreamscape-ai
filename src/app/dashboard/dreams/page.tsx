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
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#060318] via-[#0a0626] to-[#0e0a3a] text-white px-6 py-12 overflow-y-auto">
      
      {/* Dreamy background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-fuchsia-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1 }}
        className="text-center mb-10 z-10"
      >
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-400 to-cyan-300 mb-4">
          ✨ Dream Journal ✨
        </h1>
        <p className="text-cyan-200/70 text-lg max-w-2xl mx-auto">
          Your personal sanctuary of nocturnal visions and subconscious wanderings
        </p>
      </motion.div>
      
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, delay: 0.2 }}
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

      {/* Dream Journal Entries */}
      {dreams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-center py-20 z-10"
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌙
          </motion.div>
          <p className="text-fuchsia-300 text-xl mb-4 font-medium">Your journal awaits...</p>
          <p className="text-cyan-200/70 text-sm max-w-md mx-auto">
            Begin your journey into the realm of dreams. Record your first nocturnal adventure.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-full max-w-4xl z-10 space-y-6"
        >
          {dreams.map((d, i) => (
            <motion.div
              key={d.id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              whileHover={{
                scale: 1.01,
                boxShadow: "0 0 30px rgba(147,51,234,0.3)",
              }}
              className="relative bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 backdrop-blur-xl cursor-pointer hover:border-fuchsia-500/40 transition-all"
              onClick={() => router.push(`/dreams/${d.id}`)}
            >
              {/* Dream date badge */}
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-fuchsia-600/20 border border-fuchsia-400/30 text-xs text-fuchsia-300 font-medium">
                {new Date(d.createdAt).toLocaleDateString("en-US", { 
                  month: "short", 
                  day: "numeric", 
                  year: "numeric" 
                })}
              </div>

              {/* Dream entry */}
              <div className="pr-32">
                <h2 className="text-2xl font-bold mb-3 text-fuchsia-300">
                  {d.summary || "Untitled Dream"}
                </h2>
                
                <p className="text-gray-300 leading-relaxed mb-4 line-clamp-4">
                  {d.rawText}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 items-center text-sm">
                  {d.emotion && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-300">
                      Emotion: {d.emotion.toLowerCase()}
                    </span>
                  )}
                  {d.intensity && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-400/30 text-violet-300">
                      Intensity: {Math.round(d.intensity * 100)}%
                    </span>
                  )}
                  {d.tags && d.tags.length > 0 && (
                    <div className="flex gap-2">
                      {d.tags.slice(0, 3).map((tag: any) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 text-xs rounded-full bg-slate-700/50 border border-slate-600/50 text-gray-400"
                        >
                          #{tag.tagDictionary.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative dream glow */}
              <motion.div
                className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-fuchsia-600/5 blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
