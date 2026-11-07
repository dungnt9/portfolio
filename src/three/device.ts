// Device checks used by eagerly loaded UI. Keep this file free of three.js imports so the 3D stack stays lazy.

let webgl: boolean | undefined

/** Whether WebGL is available. Probed once; the probe context is released right away. */
export function hasWebGL() {
  if (webgl !== undefined) return webgl
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    webgl = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch { webgl = false }
  return webgl
}

export const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

/** Phones/tablets (touch-first) or weak CPUs: skip post-processing and render at a lower pixel ratio. */
export const isLowPower = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || isMobile() || (navigator.hardwareConcurrency ?? 8) <= 4)

/** Evaluated once at startup — used to drop expensive effects (animated blur filters) on phones / weak CPUs. */
export const LOW_POWER = isLowPower()

/** Motion keyframe fragment: a blur filter on capable devices, nothing on low-power ones (filters repaint every frame). */
export const blur = (px: number): { filter?: string } => (LOW_POWER ? {} : { filter: `blur(${px}px)` })
