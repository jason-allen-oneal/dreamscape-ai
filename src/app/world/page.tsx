
// src/app/world/page.tsx

"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import DreamWorld from "@/components/world/WorldScene";
import { motion } from "framer-motion";

interface WorldData {
  atmosphere: string;
  themes: string[];
  emotionalLandscape: string;
  visualElements: {
    colors: string[];
    motifs: string[];
  };
  entities: string[];
  characteristics: string;
}

export default function WorldPage() {
  const [worldData, setWorldData] = useState<WorldData | null>(null);
  const [dreamCount, setDreamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    fetch("/api/world")
      .then((res) => res.json())
      .then((data) => {
        setWorldData(data.worldData);
        setDreamCount(data.dreamCount);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch world data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <color attach="background" args={["#030314"]} />
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <DreamWorld />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#a855f7" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
        </Suspense>
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          minDistance={5}
          maxDistance={50}
        />
      </Canvas>

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: showInfo ? 1 : 0.3, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-6 left-6 max-w-md bg-slate-900/80 backdrop-blur-xl border border-fuchsia-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(147,51,234,0.3)]"
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(true)}
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-purple-300 mb-4">
          🌌 The Dream World
        </h1>
        
        {loading ? (
          <div className="text-cyan-200/70 animate-pulse">Loading dreamscape...</div>
        ) : worldData ? (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-fuchsia-300 font-semibold mb-1">Atmosphere</h3>
              <p className="text-cyan-100/80 text-xs leading-relaxed">{worldData.atmosphere}</p>
            </div>

            <div>
              <h3 className="text-fuchsia-300 font-semibold mb-1">Dominant Themes</h3>
              <div className="flex flex-wrap gap-2">
                {worldData.themes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-200"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-fuchsia-300 font-semibold mb-1">Emotional Landscape</h3>
              <p className="text-cyan-100/80 text-xs leading-relaxed">{worldData.emotionalLandscape}</p>
            </div>

            <div>
              <h3 className="text-fuchsia-300 font-semibold mb-1">Visual Elements</h3>
              <div className="space-y-1 text-xs">
                <div className="flex gap-2 items-center">
                  <span className="text-cyan-200/70">Colors:</span>
                  <div className="flex gap-1">
                    {worldData.visualElements.colors.map((color, i) => (
                      <span key={i} className="text-cyan-100/90">{color}</span>
                    )).reduce((prev, curr) => <>{prev}, {curr}</>)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-fuchsia-300 font-semibold mb-1">Characteristics</h3>
              <p className="text-cyan-100/80 text-xs leading-relaxed">{worldData.characteristics}</p>
            </div>

            <div className="pt-4 border-t border-fuchsia-500/20">
              <p className="text-cyan-200/70 text-xs">
                <span className="font-semibold text-fuchsia-300">{dreamCount}</span> dreams 
                have shaped this realm
              </p>
            </div>
          </div>
        ) : (
          <div className="text-cyan-200/70">
            <p className="mb-2">The dream world awaits...</p>
            <p className="text-xs">Share your dreams to help shape this collective dreamscape.</p>
          </div>
        )}
      </motion.div>

      {/* Controls hint */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-6 right-6 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl px-4 py-2 text-xs text-cyan-200/70"
      >
        🖱️ Click and drag to explore • Scroll to zoom
      </motion.div>
    </main>
  );
}
