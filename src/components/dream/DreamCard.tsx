// src/components/dream/DreamCard.tsx

"use client";

import { Dream, Media, DreamTag } from "@prisma/client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface DreamCardProps {
  dream: Dream & { 
    mediaItems?: Media[];
    tags?: (DreamTag & { tagDictionary: { value: string; type: string } })[];
  };
}

const getEmotionColor = (emotion?: string) => {
  switch (emotion) {
    case "JOY": return "from-yellow-300 via-amber-400 to-orange-500";
    case "FEAR": return "from-purple-400 via-violet-500 to-indigo-600";
    case "SADNESS": return "from-blue-400 via-cyan-500 to-teal-600";
    case "ANGER": return "from-red-400 via-rose-500 to-pink-600";
    case "LOVE": return "from-pink-400 via-rose-500 to-red-500";
    case "CURIOSITY": return "from-emerald-400 via-green-500 to-lime-500";
    default: return "from-fuchsia-400 via-purple-500 to-violet-600";
  }
};

const getEmotionGlow = (emotion?: string) => {
  switch (emotion) {
    case "JOY": return "shadow-[0_0_20px_rgba(251,191,36,0.3)]";
    case "FEAR": return "shadow-[0_0_20px_rgba(147,51,234,0.3)]";
    case "SADNESS": return "shadow-[0_0_20px_rgba(59,130,246,0.3)]";
    case "ANGER": return "shadow-[0_0_20px_rgba(239,68,68,0.3)]";
    case "LOVE": return "shadow-[0_0_20px_rgba(236,72,153,0.3)]";
    case "CURIOSITY": return "shadow-[0_0_20px_rgba(16,185,129,0.3)]";
    default: return "shadow-[0_0_20px_rgba(168,85,247,0.3)]";
  }
};

export default function DreamCard({ dream }: DreamCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dreams/${dream.id}`);
  };

  return (
    <motion.div 
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
    >
      {/* Dream card */}
      <div className={`
        relative bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6
        hover:border-white/40 transition-all duration-300
        ${getEmotionGlow(dream.emotion as string)}
        overflow-hidden
      `}>
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
          }}
        />
        
        {/* Header */}
        <div className="relative z-10 mb-4">
          <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {dream.summary || "Untitled Dream"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-cyan-200/70">
            <span>🌙</span>
            <span>{new Date(dream.createdAt).toLocaleDateString()}</span>
            {dream.emotion && (
              <span className="ml-auto px-2 py-1 rounded-full text-xs bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30">
                {dream.emotion.toLowerCase()}
              </span>
            )}
          </div>
        </div>

        {/* Dream content */}
        <div className="relative z-10 mb-4">
          <p className="text-gray-300 line-clamp-4 leading-relaxed">
            {dream.rawText}
          </p>
        </div>

        {/* Tags */}
        {dream.tags && dream.tags.length > 0 && (
          <div className="relative z-10 mb-4 flex flex-wrap gap-2">
            {dream.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-200"
              >
                {tag.tagDictionary.value}
              </span>
            ))}
            {dream.tags.length > 4 && (
              <span className="px-2 py-1 text-xs rounded-full bg-slate-700/50 text-gray-400">
                +{dream.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Media */}
        {dream.mediaItems && dream.mediaItems.length > 0 && (
          <div className="relative z-10 grid grid-cols-2 gap-2">
            {dream.mediaItems.slice(0, 2).map((m) => (
              <div key={m.id} className="relative rounded-lg overflow-hidden">
                <img
                  src={m.url}
                  alt={m.description ?? "Dream media"}
                  className="w-full h-20 object-cover border border-white/20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            ))}
          </div>
        )}

        {/* Dream energy indicator */}
        <div className="absolute top-4 right-4">
          <motion.div
            className={`w-3 h-3 rounded-full bg-gradient-to-r ${getEmotionColor(dream.emotion as string)}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}