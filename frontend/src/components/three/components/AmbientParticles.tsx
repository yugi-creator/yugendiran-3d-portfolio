import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Points } from 'three';
import { generateAmbientParticles } from '../utils/geometry';

interface AmbientParticlesProps {
  reducedMotion?: boolean;
  isLowTier?: boolean;
}

/**
 * Restrained ambient particle field for subtle background depth.
 */
export const AmbientParticles: React.FC<AmbientParticlesProps> = ({
  reducedMotion = false,
  isLowTier = false,
}) => {
  const pointsRef = useRef<Points>(null);
  const particleCount = isLowTier ? 24 : 48;

  const positions = useMemo(() => {
    return generateAmbientParticles(particleCount, 2.2, 4.0);
  }, [particleCount]);

  useFrame((_, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.03;
    pointsRef.current.rotation.x -= delta * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#a855f7"
        size={0.035}
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};
