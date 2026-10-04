import { useState, useEffect, useRef, Component, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDeviceCapability } from '../hooks/useDeviceCapability';
import { useReducedMotion3d } from '../hooks/useReducedMotion3d';
import { SceneContent } from '../components/SceneContent';
import styles from './HeroScene.module.css';

/**
 * Fallback component displayed if WebGL is unavailable, error occurs,
 * or low-power fallback is active.
 */
function HeroFallback() {
  return (
    <div className={styles.fallback} aria-hidden="true" data-testid="hero-fallback">
      <div className={styles.fallbackCore} />
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Log internally without showing broken UI to the user
    console.warn('HeroScene 3D rendering degraded to fallback:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { canRender3d, isLowTier, dpr } = useDeviceCapability();
  const prefersReducedMotion = useReducedMotion3d();

  // Pause rendering when scrolled outside viewport using IntersectionObserver
  useEffect(() => {
    const target = containerRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { root: null, rootMargin: '100px', threshold: 0.05 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!canRender3d) {
    return <HeroFallback />;
  }

  return (
    <div
      ref={containerRef}
      className={styles.canvasContainer}
      aria-hidden="true"
      data-testid="hero-canvas-container"
    >
      <ThreeErrorBoundary fallback={<HeroFallback />}>
        <Canvas
          className={styles.canvas}
          frameloop={isVisible ? 'always' : 'never'}
          dpr={dpr}
          camera={{ position: [0, 0, 6.2], fov: 45, near: 0.1, far: 30 }}
          gl={{
            antialias: !isLowTier,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000', 0);
          }}
        >
          <SceneContent reducedMotion={prefersReducedMotion} isLowTier={isLowTier} />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
}

export default HeroScene;
