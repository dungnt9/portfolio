import { useEffect } from 'react'
import Lenis from 'lenis'

const OFFSET = -72
let lenis: Lenis | null = null

/**
 * Scroll to a section by id. Uses Lenis when active, then re-checks the final position once:
 * lazy content (3D scenes, images, reveals) can change layout mid-scroll and leave us short.
 */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return false
  // Sections use content-visibility:auto, so off-screen ones only have an estimated height and the target
  // offset would be wrong. Render them all once (their real size is then remembered via
  // contain-intrinsic-size:auto), scroll, and hand skipping back to the browser afterwards.
  const root = document.documentElement
  root.classList.add('cv-all')
  void root.offsetHeight // apply the real layout before measuring
  window.setTimeout(() => root.classList.remove('cv-all'), 2500)
  if (!lenis) {
    const top = el.getBoundingClientRect().top + window.scrollY + OFFSET
    window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    return true
  }
  lenis.scrollTo(el, {
    offset: OFFSET,
    onComplete: () => {
      const drift = el.getBoundingClientRect().top + OFFSET
      if (Math.abs(drift) > 4) lenis?.scrollTo(el, { offset: OFFSET, immediate: true })
    },
  })
  return true
}

export function setScrollLocked(locked: boolean) {
  document.body.style.overflow = locked ? 'hidden' : ''
  if (locked) lenis?.stop()
  else lenis?.start()
}

/** Lenis inertial smooth scroll (mouse/trackpad). Off for reduced-motion users and on touch screens. */
export function useSmoothScroll() {
  useEffect(() => {
    // In-page anchor links → our helper (works with or without Lenis).
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      const id = a?.getAttribute('href')?.slice(1)
      if (!id) return
      if (id === 'top') { e.preventDefault(); if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' }); return }
      // Defer one frame so overlays (mobile menu) can unlock scrolling first.
      if (document.getElementById(id)) { e.preventDefault(); requestAnimationFrame(() => scrollToId(id)); history.replaceState(null, '', `#${id}`) }
    }
    document.addEventListener('click', onClick)

    // Touch screens keep native scrolling (Lenis does not smooth touch anyway, but its per-frame loop costs main-thread time).
    if (window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return () => document.removeEventListener('click', onClick)
    // lerp 0.12: still smooth, but follows the wheel closer (less input lag than the 0.1 default feel)
    lenis = new Lenis({ lerp: 0.12 })
    let raf = 0
    const loop = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { document.removeEventListener('click', onClick); cancelAnimationFrame(raf); lenis?.destroy(); lenis = null }
  }, [])
}
