import type React from 'react';

/**
 * Lighting setup balanced for a clean, light/white aesthetic with blue/purple accents.
 * Provides soft illumination and depth without harsh shadows or high GPU fill rate costs.
 */
export const SceneLighting: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.85} color="#ffffff" />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#6366f1" />
      <pointLight position={[-5, -4, -4]} intensity={0.9} color="#a855f7" distance={15} />
      <pointLight position={[3, -3, 4]} intensity={0.6} color="#38bdf8" distance={12} />
    </>
  );
};
