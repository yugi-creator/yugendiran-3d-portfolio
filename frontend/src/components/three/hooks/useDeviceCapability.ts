import { useState, useEffect } from 'react';
import { isWebGLAvailable } from '../utils/webgl';

export interface DeviceCapability {
  canRender3d: boolean;
  isLowTier: boolean;
  dpr: number | [number, number];
}

/**
 * Evaluates hardware and browser capabilities to configure optimal 3D settings
 * and determine if 3D rendering should proceed or fall back.
 */
export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>(() => {
    // Initial safe SSR-compatible evaluation
    if (typeof window === 'undefined') {
      return { canRender3d: false, isLowTier: true, dpr: 1 };
    }

    const webglSupported = isWebGLAvailable();
    if (!webglSupported) {
      return { canRender3d: false, isLowTier: true, dpr: 1 };
    }

    // Heuristic for low-tier hardware:
    // - Low concurrency (<= 2 cores)
    // - Very narrow display combined with low core count
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = window.innerWidth < 768;
    const isLowTier = cores <= 2 || (isMobile && cores <= 4);

    const targetDpr: [number, number] = isLowTier
      ? [1, 1]
      : [1, Math.min(window.devicePixelRatio || 1, 1.75)];

    return {
      canRender3d: true,
      isLowTier,
      dpr: targetDpr,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const webglSupported = isWebGLAvailable();
      if (!webglSupported) {
        setCapability({ canRender3d: false, isLowTier: true, dpr: 1 });
        return;
      }

      const cores = navigator.hardwareConcurrency || 4;
      const isMobile = window.innerWidth < 768;
      const isLowTier = cores <= 2 || (isMobile && cores <= 4);

      setCapability({
        canRender3d: true,
        isLowTier,
        dpr: isLowTier ? [1, 1] : [1, Math.min(window.devicePixelRatio || 1, 1.75)],
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return capability;
}
