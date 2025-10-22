"use client";
import { useFrame } from "@react-three/fiber";
import { Mesh, Group } from "three";
import { useRef } from "react";

function DreamOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        wireframe={true}
        transparent={true}
        opacity={0.6}
      />
    </mesh>
  );
}

function DreamParticles() {
  const groupRef = useRef<Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const particles = [];
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * Math.PI * 2;
    const radius = 8 + Math.random() * 4;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.random() - 0.5) * 8;
    
    particles.push(
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color={i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#06b6d4" : "#ec4899"}
          emissive={i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#06b6d4" : "#ec4899"}
          emissiveIntensity={0.8}
          transparent={true}
          opacity={0.4}
        />
      </mesh>
    );
  }

  return <group ref={groupRef}>{particles}</group>;
}

export default function WorldScene() {
  const mainOrbRef = useRef<Mesh>(null!);

  useFrame((_, delta) => {
    if (mainOrbRef.current) {
      mainOrbRef.current.rotation.y += delta * 0.15;
      mainOrbRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <>
      {/* Central dream nexus */}
      <mesh ref={mainOrbRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#7f5af0"
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </mesh>

      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.4}
          transparent={true}
          opacity={0.2}
        />
      </mesh>

      {/* Dream orbs orbiting */}
      <DreamOrb position={[4, 0, 0]} color="#06b6d4" scale={0.5} />
      <DreamOrb position={[-4, 1, 0]} color="#ec4899" scale={0.6} />
      <DreamOrb position={[0, -3, 4]} color="#a855f7" scale={0.4} />
      <DreamOrb position={[3, 2, -3]} color="#06b6d4" scale={0.5} />
      <DreamOrb position={[-3, -1, -3]} color="#fbbf24" scale={0.4} />

      {/* Particles */}
      <DreamParticles />

      {/* Ambient light rings */}
      {[5, 7, 9].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshStandardMaterial
            color={i === 0 ? "#a855f7" : i === 1 ? "#06b6d4" : "#ec4899"}
            emissive={i === 0 ? "#a855f7" : i === 1 ? "#06b6d4" : "#ec4899"}
            emissiveIntensity={0.3}
            transparent={true}
            opacity={0.2}
          />
        </mesh>
      ))}
    </>
  );
}
