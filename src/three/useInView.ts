import { useEffect, useState, type RefObject } from 'react'

/**
 * True while the element is within the viewport (expanded by `margin`).
 * Used to pause WebGL render loops off-screen and to lazy-mount heavy scenes just before they are needed.
 */
export function useInView(ref: RefObject<Element | null>, margin = '0px') {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return inView
}
