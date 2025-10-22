
// src/app/world/page.tsx

"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import DreamWorld from "@/components/world/WorldScene";

export default function WorldPage() {
  return (
    <main className="h-screen w-screen">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <color attach="background" args={["#030314"]} />
        <Suspense fallback={null}>
          <DreamWorld />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </main>
  );
}
