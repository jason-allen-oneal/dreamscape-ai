"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export interface DreamNode {
  id: string;
  x: number;
  y: number;
  label: string;
  emotion?: string;
}

export interface DreamEdge {
  from: string;
  to: string;
  weight: number;
}

// ✅ Export as default
export default function GlobalDreamMapClient({
  nodes,
  edges,
}: {
  nodes: DreamNode[];
  edges: DreamEdge[];
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTagClick = (tagId: string, tagLabel: string) => {
    if (selectedTag === tagId) {
      setSelectedTag(null); // Deselect if already selected
    } else {
      setSelectedTag(tagId);
      console.log(`Clicked tag: ${tagLabel} (${tagId})`);
    }
  };

  // Create proper tag cloud layout with unique tags
  const createTagCloud = (nodes: DreamNode[]) => {
    const uniqueTags = new Map<string, { node: DreamNode; count: number }>();
    
    // Count occurrences of each tag
    nodes.forEach(node => {
      if (uniqueTags.has(node.label)) {
        uniqueTags.get(node.label)!.count++;
      } else {
        uniqueTags.set(node.label, { node, count: 1 });
      }
    });

    // Convert to array and sort by count (most frequent first)
    const tagArray = Array.from(uniqueTags.values()).sort((a, b) => b.count - a.count);
    
    // Generate spiral layout for tag cloud
    const centerX = 50;
    const centerY = 50;
    const maxRadius = 35;
    
    return tagArray.map((tagData, index) => {
      const angle = (index / tagArray.length) * Math.PI * 2;
      const radius = Math.min(maxRadius * (0.3 + (tagData.count / Math.max(...tagArray.map(t => t.count)))), maxRadius);
      
      // Add some randomness to break the perfect spiral, but keep it smaller
      const jitter = (Math.random() - 0.5) * 8;
      const x = centerX + Math.cos(angle) * radius + jitter;
      const y = centerY + Math.sin(angle) * radius + jitter;
      
      // More conservative bounds to ensure tags stay on screen
      const margin = 15; // 15% margin from edges
      return {
        ...tagData.node,
        x: Math.max(margin, Math.min(100 - margin, x)),
        y: Math.max(margin, Math.min(100 - margin, y)),
        count: tagData.count,
        size: Math.max(12, Math.min(24, 12 + tagData.count * 3)) // Size based on frequency
      };
    });
  };

  const tagCloud = createTagCloud(nodes);

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
      case "JOY": return "shadow-[0_0_20px_rgba(251,191,36,0.4)]";
      case "FEAR": return "shadow-[0_0_20px_rgba(147,51,234,0.4)]";
      case "SADNESS": return "shadow-[0_0_20px_rgba(59,130,246,0.4)]";
      case "ANGER": return "shadow-[0_0_20px_rgba(239,68,68,0.4)]";
      case "LOVE": return "shadow-[0_0_20px_rgba(236,72,153,0.4)]";
      case "CURIOSITY": return "shadow-[0_0_20px_rgba(16,185,129,0.4)]";
      default: return "shadow-[0_0_20px_rgba(168,85,247,0.4)]";
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Cosmic title with floating effect */}
      <motion.h1 
        className="absolute top-8 left-1/2 -translate-x-1/2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 z-10"
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
        🌍 Collective Dreamscape ✨
      </motion.h1>

      {/* Subtitle */}
      <motion.p 
        className="absolute top-20 left-1/2 -translate-x-1/2 text-sm text-cyan-200/70 z-10"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      >
        Where all dreamers' subconscious thoughts converge in the cosmic void
      </motion.p>

      {/* Selected tag info panel */}
      {selectedTag && (
        <motion.div
          className="absolute top-32 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 z-20 max-w-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">
              {tagCloud.find(t => t.id === selectedTag)?.label}
            </h3>
            <p className="text-sm text-gray-300 mb-2">
              Appears in {tagCloud.find(t => t.id === selectedTag)?.count} dream{tagCloud.find(t => t.id === selectedTag)?.count !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-400">
              Click to explore shared dreams with this theme
            </p>
            <button
              onClick={() => setSelectedTag(null)}
              className="mt-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}

      {nodes.length === 0 ? (
        <div className="flex items-center justify-center h-screen">
          <motion.div 
            className="text-center"
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
            <p className="text-cyan-300 text-xl mb-4 font-medium">The collective unconscious slumbers...</p>
            <p className="text-cyan-200/70 text-sm mb-8 max-w-md">
              No shared dreams have been recorded yet. The cosmic dream realm awaits the first brave dreamer to share their vision.
            </p>
            <motion.a 
              href="/dreams/new" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✨ Share Your First Dream ✨
            </motion.a>
          </motion.div>
        </div>
      ) : (
        <>
      {/* Cosmic background particles */}
      <div className="absolute inset-0">
        {[...Array(75)].map((_, i) => (
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

      {/* Ethereal cosmic connections */}
      <svg className="absolute w-full h-full pointer-events-none">
        {edges.map((edge, i) => {
          const from = tagCloud.find((n) => n.id === edge.from);
          const to = tagCloud.find((n) => n.id === edge.to);
          if (!from || !to) return null;
          
          return (
            <motion.line
              key={i}
              x1={`${from.x}vw`}
              y1={`${from.y}vh`}
              x2={`${to.x}vw`}
              y2={`${to.y}vh`}
              stroke="url(#cosmicGradient)"
              strokeWidth={Math.max(edge.weight * 3, 0.5)}
              opacity={0.4}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.1 }}
            />
          );
        })}
        
        {/* Cosmic gradient definition */}
        <defs>
          <linearGradient id="cosmicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(168,85,247,0.4)" />
            <stop offset="50%" stopColor="rgba(236,72,153,0.3)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.4)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Collective dream tag cloud */}
      {tagCloud.map((tag, index) => {
        const rotation = (Math.random() - 0.5) * 20; // Less rotation for better readability
        const isSelected = selectedTag === tag.id;
        const isHovered = hoveredTag === tag.id;
        
        return (
          <motion.div
            key={tag.id}
            className="absolute cursor-pointer"
            style={{
              left: `${tag.x}vw`,
              top: `${tag.y}vh`,
              transform: `translate(-50%, -50%)`,
            }}
            initial={{ 
              opacity: 0, 
              scale: 0,
              rotate: rotation - 30,
            }}
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [0.8, 1.1, 0.8],
              rotate: [rotation - 5, rotation + 5, rotation - 5],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "mirror",
              delay: index * 0.1,
            }}
            onClick={() => handleTagClick(tag.id, tag.label)}
          >
            <motion.div
              className={`
                px-3 py-1.5 rounded-full
                bg-gradient-to-r ${getEmotionColor(tag.emotion)}
                ${getEmotionGlow(tag.emotion)}
                backdrop-blur-sm
                border ${isSelected ? 'border-white/60' : 'border-white/20'}
                text-white font-medium
                select-none
                relative overflow-hidden
                ${isSelected ? 'ring-2 ring-white/40' : ''}
              `}
              style={{ fontSize: `${tag.size}px` }}
              whileHover={{
                boxShadow: "0 0 30px rgba(255,255,255,0.3)",
              }}
            >
              {/* Cosmic shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3 + Math.random() * 2,
                }}
              />
              
              <span className="relative z-10">
                {tag.label}
                {tag.count > 1 && (
                  <span className="ml-1 text-xs opacity-70">({tag.count})</span>
                )}
              </span>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Floating cosmic orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-40 h-40 rounded-full opacity-5"
            style={{
              background: `radial-gradient(circle, ${getEmotionColor()} 0%, transparent 70%)`,
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
        </>
      )}
    </div>
  );
}
