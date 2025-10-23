"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import DreamWorld from "@/components/world/WorldScene";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";
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
    <main className="relative h-screen w-screen overflow-hidden text-white">
      <SpectralBackdrop className="opacity-40" />

      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
          <color attach="background" args={["#030314"]} />
          <Suspense fallback={null}>
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
            <DreamWorld />
            <ambientLight intensity={0.35} />
            <pointLight position={[10, 12, 10]} intensity={0.9} color="#a855f7" />
            <pointLight position={[-10, -6, -12]} intensity={0.5} color="#06b6d4" />
          </Suspense>
          <OrbitControls enableZoom enablePan minDistance={5} maxDistance={50} />
        </Canvas>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: showInfo ? 1 : 0.2, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute left-6 top-6 max-w-md rounded-2xl border border-white/12 bg-black/40 px-6 py-6 backdrop-blur"
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(true)}
      >
        <h1 className="mb-4 text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-fuchsia-200 to-violet-200">
          🌌 Collective Dreamscape
        </h1>
        {loading ? (
          <p className="text-sm text-white/60">Scrying the dream currents...</p>
        ) : worldData ? (
          <div className="space-y-4 text-sm text-white/75">
            <section>
              <h2 className="mb-1 text-xs uppercase tracking-[0.35em] text-white/45">
                Atmosphere
              </h2>
              <p className="text-xs leading-relaxed text-white/70">
                {worldData.atmosphere}
              </p>
            </section>

            <section>
              <h2 className="mb-1 text-xs uppercase tracking-[0.35em] text-white/45">
                Dominant Themes
              </h2>
              <div className="flex flex-wrap gap-2">
                {worldData.themes.map((theme, index) => (
                  <span
                    key={`${theme}-${index}`}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/65"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-1 text-xs uppercase tracking-[0.35em] text-white/45">
                Emotional Landscape
              </h2>
              <p className="text-xs leading-relaxed text-white/70">
                {worldData.emotionalLandscape}
              </p>
            </section>

            <section className="space-y-1 text-xs text-white/70">
              <h2 className="text-xs uppercase tracking-[0.35em] text-white/45">
                Visual Elements
              </h2>
              <div className="flex flex-wrap gap-2">
                {worldData.visualElements.colors.map((color, index) => (
                  <span key={`color-${index}`} className="text-white/60">
                    {color}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {worldData.visualElements.motifs.map((motif, index) => (
                  <span key={`motif-${index}`} className="text-white/60">
                    {motif}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-1 text-xs uppercase tracking-[0.35em] text-white/45">
                Characteristics
              </h2>
              <p className="text-xs leading-relaxed text-white/70">
                {worldData.characteristics}
              </p>
            </section>

            {worldData.entities.length > 0 && (
              <section>
                <h2 className="mb-1 text-xs uppercase tracking-[0.35em] text-white/45">
                  Entities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {worldData.entities.map((entity, index) => (
                    <span
                      key={`entity-${index}`}
                      className="rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.35em] text-white/60"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <div className="pt-4 text-xs uppercase tracking-[0.3em] text-white/50">
              {dreamCount} dreams compose this realm
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/60">
            Share your visions to awaken this collective landscape.
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-6 right-6 rounded-xl border border-white/15 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/55 backdrop-blur"
      >
        Drag to orbit • Scroll to descend
      </motion.div>
    </main>
  );
}
