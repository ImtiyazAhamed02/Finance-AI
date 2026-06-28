import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCoin({ position, delay = 0 }) {
  const mesh = useRef();
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += 0.015;
    mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + delay) * 0.3;
  });

  return (
    <Float floatIntensity={0.5} speed={1.5}>
      <mesh ref={mesh} position={position} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.95}
          roughness={0.05}
          emissive="#F59E0B"
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

function GlowOrb({ position, color = '#6366F1', scale = 1 }) {
  const mesh = useRef();
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.material.distort = 0.3 + Math.sin(state.clock.elapsedTime) * 0.1;
  });

  return (
    <Sphere ref={mesh} position={position} args={[scale, 32, 32]}>
      <MeshDistortMaterial
        color={color}
        transparent
        opacity={0.15}
        distort={0.3}
        speed={2}
        wireframe={false}
      />
    </Sphere>
  );
}

function RotatingRing({ position, color = '#6366F1', radius = 2 }) {
  const mesh = useRef();
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.3;
    mesh.current.rotation.z = state.clock.elapsedTime * 0.2;
  });

  return (
    <mesh ref={mesh} position={position}>
      <torusGeometry args={[radius, 0.04, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.6} />
    </mesh>
  );
}

function FloatingCard({ position }) {
  const mesh = useRef();
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7) * 0.2;
  });

  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[1.6, 1, 0.05]} />
      <meshStandardMaterial
        color="#0F172A"
        metalness={0.3}
        roughness={0.7}
        emissive="#6366F1"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function Particles({ count = 80 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  const mesh = useRef();
  useFrame(() => {
    if (mesh.current) mesh.current.rotation.y += 0.0008;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#6366F1" size={0.06} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366F1" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#06B6D4" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#F59E0B" />

      <Stars radius={80} depth={50} count={3000} factor={4} saturation={0} fade />
      <Particles count={100} />

      {/* Floating coins */}
      <FloatingCoin position={[-3, 1, 0]} delay={0} />
      <FloatingCoin position={[3, -0.5, -1]} delay={1.5} />
      <FloatingCoin position={[0, 2, 1]} delay={3} />
      <FloatingCoin position={[-2, -2, 0]} delay={0.8} />
      <FloatingCoin position={[4, 1.5, -2]} delay={2} />

      {/* Credit cards */}
      <FloatingCard position={[-4, 0, -2]} />
      <FloatingCard position={[4, -1, -1]} />

      {/* Glowing orbs */}
      <GlowOrb position={[0, 0, 0]} color="#6366F1" scale={2.5} />
      <GlowOrb position={[-5, 2, -3]} color="#06B6D4" scale={1.5} />
      <GlowOrb position={[5, -2, -3]} color="#8B5CF6" scale={1.2} />

      {/* Rotating rings */}
      <RotatingRing position={[0, 0, 0]} color="#6366F1" radius={3.5} />
      <RotatingRing position={[0, 0, 0]} color="#06B6D4" radius={4.5} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
}
