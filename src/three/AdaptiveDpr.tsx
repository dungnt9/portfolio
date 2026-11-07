import { PerformanceMonitor } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useState, type ReactNode } from 'react'

/**
 * Adaptive render resolution: start conservative, raise the pixel ratio while the device keeps a steady
 * frame rate, drop it as soon as frames start to stall. Weak phones settle at 1×, strong machines go up to `max`.
 */
export function useAdaptiveDpr(max: number, start = Math.min(1.25, max)) {
  const [dpr, setDpr] = useState(start)
  const monitor: ReactNode = (
    <PerformanceMonitor
      bounds={() => [45, 58]}
      flipflops={3}
      onIncline={() => setDpr((d) => Math.min(max, +(d + 0.25).toFixed(2)))}
      onDecline={() => setDpr((d) => Math.max(1, +(d - 0.25).toFixed(2)))}
      onFallback={() => setDpr(1)}
    />
  )
  return [dpr, monitor] as const
}

/**
 * Drives a Canvas with frameloop="demand" at a fixed rate (e.g. 30 fps on phones): slow ambient scenes look the
 * same, but the GPU/CPU work halves and the main thread stays free for touch scrolling.
 */
export function FrameLimiter({ fps }: { fps: number }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let raf = 0, last = 0
    const step = 1000 / fps
    const loop = (t: number) => { if (t - last >= step - 2) { last = t; invalidate() } raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [fps, invalidate])
  return null
}
