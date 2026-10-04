import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';

interface CoreNodeProps {
  reducedMotion?: boolean;
}

/**
 * Central geometric AI computation core.
 * Features an outer translucent faceted icosahedron, an inner wireframe octahedron,
 * and a gently pulsing central nucleus.
 */
export const CoreNode: React.FC<CoreNodeProps> = ({ reducedMotion = false }) => {
  const groupRef = useRef<Group>(null);
  const outerMeshRef = useRef<Mesh>(null);
  const innerMeshRef = useRef<Mesh>(null);
  const nucleusRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion) return;

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }

    if (outerMeshRef.current) {
      outerMeshRef.current.rotation.x += delta * 0.08;
      outerMeshRef.current.rotation.z -= delta * 0.05;
    }

    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.x -= delta * 0.12;
      innerMeshRef.current.rotation.y += delta * 0.18;
    }

    if (nucleusRef.current) {
      const pulse = 1 + Math.sin(Date.now() * 0.002) * 0.08;
      nucleusRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer translucent crystalline structure */}
      <mesh ref={outerMeshRef}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial
          color="#6366f1"
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.32}
          depthWrite={false}
          wireframe={false}
        />
      </mesh>

      {/* Outer edge accents for architectural clarity */}
      <mesh>
        <icosahedronGeometry args={[1.152, 1]} />
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Inner geometric calculation structure */}
      <mesh ref={innerMeshRef}>
        <octahedronGeometry args={[0.68, 0]} />
        <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.7} />
      </mesh>

      {/* Center glowing nucleus */}
      <mesh ref={nucleusRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#4f46e5"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
};
