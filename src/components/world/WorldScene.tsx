"use client";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { useRef } from "react";

export default function WorldScene() {
  const meshRef = useRef<Mesh>(null!);

  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial color="#7f5af0" wireframe />
    </mesh>
  );
}
