import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D } from 'three';
import type { Group, InstancedMesh, BufferGeometry } from 'three';
import {
  generateFibonacciSpherePoints,
  generateConnectionLines,
  type NodePoint,
} from '../utils/geometry';

interface NetworkGraphProps {
  reducedMotion?: boolean;
  isLowTier?: boolean;
}

/**
 * Computational network graph consisting of instanced data nodes
 * and interconnected dynamic line segments.
 */
export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  reducedMotion = false,
  isLowTier = false,
}) => {
  const groupRef = useRef<Group>(null);
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const lineGeometryRef = useRef<BufferGeometry>(null);

  const nodeCount = isLowTier ? 16 : 24;

  const { points, linePositions } = useMemo(() => {
    const pts: NodePoint[] = generateFibonacciSpherePoints(nodeCount, 2.05, 0.2);
    const lines = generateConnectionLines(pts, 1.45, 3);
    return { points: pts, linePositions: lines };
  }, [nodeCount]);

  // Set instance matrices once
  useEffect(() => {
    if (!instancedMeshRef.current) return;

    const dummy = new Object3D();
    points.forEach((point, i) => {
      dummy.position.set(...point.position);
      dummy.scale.set(point.scale, point.scale, point.scale);
      dummy.updateMatrix();
      instancedMeshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [points]);

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y -= delta * 0.1;
    groupRef.current.rotation.x += delta * 0.04;
  });

  return (
    <group ref={groupRef}>
      {/* Instanced sphere nodes (1 single draw call for all nodes) */}
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, points.length]}>
        <sphereGeometry args={[0.065, 8, 8]} />
        <meshStandardMaterial
          color="#4f46e5"
          emissive="#6366f1"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.4}
        />
      </instancedMesh>

      {/* Interconnecting network line segments (1 single draw call) */}
      <lineSegments>
        <bufferGeometry ref={lineGeometryRef}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#818cf8" transparent opacity={0.38} linewidth={1} />
      </lineSegments>
    </group>
  );
};
