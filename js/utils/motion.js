export const REDUCED_MOTION_MEDIA = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(REDUCED_MOTION_MEDIA).matches;
}

export function motionSafeScrollBehavior(preferred = 'smooth') {
  return prefersReducedMotion() ? 'auto' : preferred;
}
