import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import { SceneLighting } from './SceneLighting';
import { CoreNode } from './CoreNode';
import { NetworkGraph } from './NetworkGraph';
import { OrbitalRings } from './OrbitalRings';
import { AmbientParticles } from './AmbientParticles';

interface SceneContentProps {
  reducedMotion: boolean;
  isLowTier: boolean;
}

/**
 * Root scene composer handling lighting, responsive positioning,
 * interactive pointer parallax, and assembly of subcomponents.
 */
export const SceneContent: React.FC<SceneContentProps> = ({ reducedMotion, isLowTier }) => {
  const masterGroupRef = useRef<Group>(null);
  const { viewport } = useThree();

  // Responsive scale factor based on viewport size
  const scale = viewport.width < 5.5 ? 0.75 : viewport.width < 8 ? 0.9 : 1.0;

  useFrame((state, delta) => {
    if (!masterGroupRef.current) return;

    if (reducedMotion) {
      // In reduced motion, maintain a stable orientation
      masterGroupRef.current.rotation.set(0.1, 0.2, 0);
      return;
    }

    // Gentle global float
    masterGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06;

    // Subtle pointer parallax (restrained and non-intrusive)
    const targetX = -state.pointer.y * 0.18;
    const targetY = state.pointer.x * 0.25;

    const damping = Math.min(delta * 4, 1);
    masterGroupRef.current.rotation.x += (targetX - masterGroupRef.current.rotation.x) * damping;
    masterGroupRef.current.rotation.y += (targetY - masterGroupRef.current.rotation.y) * damping;
  });

  return (
    <>
      <SceneLighting />
      <group ref={masterGroupRef} scale={scale} position={[0, 0, 0]}>
        <CoreNode reducedMotion={reducedMotion} />
        <NetworkGraph reducedMotion={reducedMotion} isLowTier={isLowTier} />
        <OrbitalRings reducedMotion={reducedMotion} />
        <AmbientParticles reducedMotion={reducedMotion} isLowTier={isLowTier} />
      </group>
    </>
  );
};
