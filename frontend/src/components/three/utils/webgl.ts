/**
 * Utility to detect WebGL and WebGL2 availability safely.
 * Gracefully returns false if disabled, unavailable, or restricted by browser context.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  // Detect JSDOM / test environments where WebGL is not natively implemented
  if (
    typeof navigator !== 'undefined' &&
    (navigator.userAgent?.includes('jsdom') || (window as unknown as { __jsdom?: boolean }).__jsdom)
  ) {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    if (typeof canvas.getContext !== 'function') {
      return false;
    }
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(
      (gl && gl instanceof WebGLRenderingContext) ||
      (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext),
    );
  } catch {
    return false;
  }
}
