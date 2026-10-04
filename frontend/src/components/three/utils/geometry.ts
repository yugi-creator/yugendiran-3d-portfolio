import { Vector3 } from 'three';

export interface NodePoint {
  position: [number, number, number];
  scale: number;
}

/**
 * Distributes points evenly on a sphere using the Fibonacci lattice algorithm.
 */
export function generateFibonacciSpherePoints(
  count: number,
  radius: number,
  jitter = 0.15,
): NodePoint[] {
  const points: NodePoint[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians (~2.39996)

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y); // radius at y
    const theta = phi * i;

    // Apply slight pseudo-random jitter for an organic yet structured network look
    const rJitter = radius + Math.sin(i * 1.5) * jitter;
    const x = Math.cos(theta) * radiusAtY * rJitter;
    const z = Math.sin(theta) * radiusAtY * rJitter;

    points.push({
      position: [x, y * rJitter, z],
      scale: 0.8 + Math.sin(i * 2.3) * 0.4,
    });
  }

  return points;
}

/**
 * Calculates line segment vertices between pairs of nodes that are within a maximum distance.
 */
export function generateConnectionLines(
  points: NodePoint[],
  maxDistance = 1.35,
  maxConnectionsPerNode = 3,
): Float32Array {
  const linePositions: number[] = [];
  const connectionCounts = new Array(points.length).fill(0);

  for (let i = 0; i < points.length; i++) {
    const p1 = new Vector3(...points[i].position);

    for (let j = i + 1; j < points.length; j++) {
      if (connectionCounts[i] >= maxConnectionsPerNode) break;
      if (connectionCounts[j] >= maxConnectionsPerNode) continue;

      const p2 = new Vector3(...points[j].position);
      const dist = p1.distanceTo(p2);

      if (dist <= maxDistance) {
        linePositions.push(p1.x, p1.y, p1.z);
        linePositions.push(p2.x, p2.y, p2.z);
        connectionCounts[i]++;
        connectionCounts[j]++;
      }
    }
  }

  return new Float32Array(linePositions);
}

/**
 * Generates restrained ambient particle positions in a spherical volume.
 */
export function generateAmbientParticles(
  count: number,
  minRadius: number,
  maxRadius: number,
): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = minRadius + Math.cbrt(Math.random()) * (maxRadius - minRadius);

    const sinPhi = Math.sin(phi);
    const x = r * sinPhi * Math.cos(theta);
    const y = r * sinPhi * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
}
