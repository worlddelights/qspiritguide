import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Line, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Pendulum3DProps {
  onFreeze: (state: { theta: number; omega: number; timeDeltaMs: number }) => void;
  isFrozen: boolean;
}

function PendulumLogic({ onFreeze, isFrozen }: Pendulum3DProps) {
  const bobRef = useRef<THREE.Mesh>(null);
  const stringRef = useRef<any>(null);
  const pivot = new THREE.Vector3(0, 4, 0);
  const length = 5;
  const gravity = 9.81;

  const [theta, setTheta] = useState(Math.PI / 4); // Initial angle
  const [omega, setOmega] = useState(0); // Angular velocity
  const [timeState, setTimeState] = useState(0);

  const { pointer } = useThree(); // mouse NDC

  useFrame((state, delta) => {
    if (isFrozen) return;

    // Simulate pendulum physics
    const alpha = -(gravity / length) * Math.sin(theta); // Angular acceleration
    // Add some damping
    const newOmega = omega + alpha * delta * 0.99;
    const newTheta = theta + newOmega * delta;

    setOmega(newOmega);
    setTheta(newTheta);
    setTimeState((t) => t + delta);

    if (bobRef.current) {
      const x = pivot.x + length * Math.sin(newTheta);
      const y = pivot.y - length * Math.cos(newTheta);
      bobRef.current.position.set(x, y, 0);

      // Update string
      if (stringRef.current) {
        const positions = new Float32Array([
          pivot.x, pivot.y, pivot.z,
          x, y, 0
        ]);
        stringRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      }
    }
  });

  const handlePointerDown = () => {
    if (!isFrozen) {
      onFreeze({ theta, omega, timeDeltaMs: timeState * 1000 });
    }
  };

  return (
    <group>
      {/* Pivot */}
      <Sphere args={[0.2, 16, 16]} position={pivot}>
        <meshStandardMaterial color="#888" />
      </Sphere>

      {/* String */}
      <line ref={stringRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </line>

      {/* Bob */}
      <Sphere 
        ref={bobRef} 
        args={[0.6, 32, 32]} 
        onPointerDown={handlePointerDown}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <meshPhysicalMaterial 
          color={isFrozen ? "#00ffff" : "#a855f7"} 
          emissive={isFrozen ? "#00ffff" : "#a855f7"}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
        />
      </Sphere>

      {/* Harmonic Ground Dial */}
      <Plane args={[15, 15]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
      </Plane>
    </group>
  );
}

export default function Pendulum3D({ onFreeze, isFrozen }: Pendulum3DProps) {
  return (
    <div className="h-[400px] w-full rounded-2xl bg-black/50 border border-white/10 overflow-hidden relative cursor-crosshair">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <PendulumLogic onFreeze={onFreeze} isFrozen={isFrozen} />
      </Canvas>
      {isFrozen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 px-6 py-3 rounded-full text-cyan-400 font-mono text-sm border border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] animate-pulse">
            Resonance Locked
          </div>
        </div>
      )}
    </div>
  );
}
