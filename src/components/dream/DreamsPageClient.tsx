// src/components/dream/DreamsPageClient.tsx

"use client";

import { motion } from "framer-motion";
import DreamCard from "./DreamCard";
import { Dream, Media, DreamTag } from "@prisma/client";

interface DreamsPageClientProps {
  dreams: (Dream & { 
    mediaItems?: Media[];
    tags?: (DreamTag & { tagDictionary: { value: string; type: string } })[];
  })[];
}

export default function DreamsPageClient({ dreams }: DreamsPageClientProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0a2e] via-[#16213e] to-[#0f3460] text-white">
      {/* Dreamy background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -100, -200],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating dream orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full opacity-5"
            style={{
              background: `radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.05, 0.1, 0.05],
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              repeatType: "mirror",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 text-center pt-16 pb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1 
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 mb-4"
          animate={{
            y: [0, -5, 0],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        >
          🌙 Shared Dreams ✨
        </motion.h1>
        <motion.p 
          className="text-lg text-cyan-200/70 max-w-2xl mx-auto"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        >
          Explore the collective unconscious - dreams shared by dreamers around the world
        </motion.p>
      </motion.div>

      {/* Dreams Grid */}
      <div className="relative z-10 px-6 pb-16">
        {dreams.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌌
            </motion.div>
            <p className="text-cyan-300 text-xl mb-4 font-medium">The dream realm slumbers...</p>
            <p className="text-cyan-200/70 text-sm max-w-md mx-auto">
              No shared dreams have been recorded yet. The cosmic dream realm awaits the first brave dreamer to share their vision.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {dreams.map((dream, index) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <DreamCard dream={dream} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
