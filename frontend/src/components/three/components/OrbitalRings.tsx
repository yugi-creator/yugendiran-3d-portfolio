import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';

interface OrbitalRingsProps {
  reducedMotion?: boolean;
}

/**
 * Elegant orbital data rings representing computational cycles.
 */
export const OrbitalRings: React.FC<OrbitalRingsProps> = ({ reducedMotion = false }) => {
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const parentRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion) return;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.12;
      ring1Ref.current.rotation.x += delta * 0.05;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.09;
      ring2Ref.current.rotation.y += delta * 0.07;
    }
  });

  return (
    <group ref={parentRef}>
      {/* Primary inner orbital ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[2.3, 0.007, 8, 48]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.45} />
      </mesh>

      {/* Secondary outer orbital ring */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, -Math.PI / 5, 0]}>
        <torusGeometry args={[2.85, 0.005, 8, 48]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};
