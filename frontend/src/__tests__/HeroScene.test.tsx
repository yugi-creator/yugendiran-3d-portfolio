import { render, screen, waitFor, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isWebGLAvailable } from '../components/three/utils/webgl';
import {
  generateFibonacciSpherePoints,
  generateConnectionLines,
  generateAmbientParticles,
} from '../components/three/utils/geometry';
import { useDeviceCapability } from '../components/three/hooks/useDeviceCapability';
import { useReducedMotion3d } from '../components/three/hooks/useReducedMotion3d';
import { HeroScene } from '../components/three/HeroScene/HeroScene';
import { Hero } from '../components/sections/Hero/Hero';

// Mock IntersectionObserver
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  );
});

describe('3D Utilities & Geometry', () => {
  it('detects WebGL availability safely', () => {
    const available = isWebGLAvailable();
    expect(typeof available).toBe('boolean');
  });

  it('generates valid Fibonacci sphere points without NaN coordinates', () => {
    const points = generateFibonacciSpherePoints(16, 2.0);
    expect(points).toHaveLength(16);

    points.forEach((pt) => {
      expect(pt.position).toHaveLength(3);
      expect(Number.isFinite(pt.position[0])).toBe(true);
      expect(Number.isFinite(pt.position[1])).toBe(true);
      expect(Number.isFinite(pt.position[2])).toBe(true);
      expect(pt.scale).toBeGreaterThan(0);
    });
  });

  it('generates valid connection lines buffer', () => {
    const points = generateFibonacciSpherePoints(12, 1.5);
    const lines = generateConnectionLines(points, 2.0, 3);

    expect(lines).toBeInstanceOf(Float32Array);
    // Buffer coordinates must be multiples of 6 (2 vertices * 3 coords each)
    expect(lines.length % 6).toBe(0);
    for (let i = 0; i < lines.length; i++) {
      expect(Number.isFinite(lines[i])).toBe(true);
    }
  });

  it('generates valid ambient particle coordinates', () => {
    const count = 20;
    const particles = generateAmbientParticles(count, 1.0, 3.0);

    expect(particles).toBeInstanceOf(Float32Array);
    expect(particles.length).toBe(count * 3);
    for (let i = 0; i < particles.length; i++) {
      expect(Number.isFinite(particles[i])).toBe(true);
    }
  });
});

describe('Device Capabilities & Reduced Motion Hooks', () => {
  it('useReducedMotion3d detects prefers-reduced-motion media query correctly', () => {
    // Test default when media query does not match
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion3d());
    expect(result.current).toBe(true);
  });

  it('useDeviceCapability safely determines capability and dpr limits in non-WebGL environments', () => {
    const { result } = renderHook(() => useDeviceCapability());
    expect(typeof result.current.canRender3d).toBe('boolean');
    expect(typeof result.current.isLowTier).toBe('boolean');
    expect(result.current.dpr).toBeDefined();
  });
});

describe('Hero 3D Integration & Fallback', () => {
  it('renders Hero component with #hero-visual mount point', async () => {
    render(<Hero />);
    const visualMount = document.getElementById('hero-visual');
    expect(visualMount).toBeInTheDocument();
    expect(visualMount).toHaveAttribute('aria-hidden', 'true');
    await waitFor(() => {
      expect(document.getElementById('hero-visual')).toBeInTheDocument();
    });
  });

  it('renders fallback when WebGL is unavailable in test environment', () => {
    render(<HeroScene />);
    // In JSDOM without WebGL, it should gracefully render the fallback without crashing
    const fallback = screen.getByTestId('hero-fallback');
    expect(fallback).toBeInTheDocument();
  });

  it('preserves all user-facing textual content and accessibility semantics in Hero', async () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('View Projects')).toBeInTheDocument();
    expect(screen.getByText('Download Resume')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });
});
