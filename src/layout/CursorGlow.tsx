import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/theme/ThemeProvider'

/** Interactive elements the frame wraps; larger ones (cards) get the ring cursor instead. */
const TARGET = 'a,button,[role="button"],summary,label[for]'
const MAX_W = 420, MAX_H = 96, PAD = 6

/** Hardware cursor SVGs (drawn by the OS compositor → zero latency, unlike any DOM-drawn cursor). */
function cursorSvg(color: string, ring: boolean) {
  const svg = ring
    ? `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='11' fill='${color}' fill-opacity='.12' stroke='${color}' stroke-width='1.6'/><circle cx='16' cy='16' r='2.5' fill='${color}'/></svg>`
    : `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='8' fill='${color}' fill-opacity='.18'/><circle cx='10' cy='10' r='4.2' fill='${color}' stroke='white' stroke-opacity='.9' stroke-width='1.3'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${ring ? '16 16' : '10 10'}`
}

/**
 * "Magnetic morph" pointer (fine pointers only).
 * The dot is a real CSS cursor, so it never lags. Hovering a button/link slides a glassy frame onto it that
 * takes the element's exact shape (size + corner radius) and keeps tracking it while it moves (Magnetic CTAs).
 * The frame is driven by CSS transitions written straight to its style (no React renders); a soft glow trails behind.
 */
export function CursorGlow() {
  const { mode, accent } = useTheme()
  const [enabled] = useState(() => window.matchMedia('(pointer: fine)').matches)
  const frame = useRef<HTMLDivElement>(null)

  // theme-coloured cursors, exposed to CSS as variables
  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    const color = getComputedStyle(root).getPropertyValue('--accent').trim() || '#22d3ee'
    root.style.setProperty('--cursor-dot', cursorSvg(color, false))
    root.style.setProperty('--cursor-ring', cursorSvg(color, true))
    root.classList.add('has-custom-cursor')
    return () => root.classList.remove('has-custom-cursor')
  }, [enabled, mode, accent])

  const gx0 = useMotionValue(-400), gy0 = useMotionValue(-400)
  const gx = useSpring(gx0, { stiffness: 220, damping: 30 }), gy = useSpring(gy0, { stiffness: 220, damping: 30 })

  useEffect(() => {
    const f = frame.current
    if (!enabled || !f) return
    const root = document.documentElement
    let target: HTMLElement | null = null
    let raf = 0
    let px = -400, py = -400

    let last = [NaN, NaN, NaN, NaN]
    const draw = (x: number, y: number, w: number, h: number, instant = false) => {
      // re-writing (even sub-pixel) values every frame would restart the CSS transition forever → only on real change
      if (!instant && [x, y, w, h].every((v, i) => Math.abs(v - last[i]) < 0.5)) return
      last = [x, y, w, h]
      if (instant) f.style.transition = 'none'
      f.style.transform = `translate3d(${x}px,${y}px,0)`
      f.style.width = `${w}px`; f.style.height = `${h}px`
      if (instant) { void f.offsetWidth; f.style.transition = '' }
    }
    const fit = () => {
      if (!target?.isConnected) return
      const r = target.getBoundingClientRect()
      draw(r.left - PAD, r.top - PAD, r.width + PAD * 2, r.height + PAD * 2)
    }
    // keep hugging the element while it moves (Magnetic buttons, scrolling)
    const track = () => { fit(); raf = requestAnimationFrame(track) }
    const ring = (on: boolean) => { if (on) root.dataset.cursor = 'ring'; else delete root.dataset.cursor }
    const release = () => {
      cancelAnimationFrame(raf)
      if (target && f.style.opacity === '1') draw(px - 12, py - 12, 24, 24) // shrink back into the pointer
      f.style.opacity = '0'
      target = null
    }

    const move = (e: PointerEvent) => {
      px = e.clientX; py = e.clientY
      gx0.set(px); gy0.set(py)
      const el = (e.target as HTMLElement)?.closest?.(TARGET) as HTMLElement | null
      if (el === target) return
      ring(false)
      if (!el) { release(); return }
      const r = el.getBoundingClientRect()
      if (r.width > MAX_W || r.height > MAX_H) { release(); target = el; ring(true); return } // big cards: ring cursor only
      const fromIdle = f.style.opacity !== '1'
      target = el
      const br = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
      f.style.borderRadius = br >= Math.min(r.width, r.height) / 2 - 1 ? '9999px' : `${br + PAD}px`
      if (fromIdle) draw(px - 12, py - 12, 24, 24, true) // grow out of the pointer
      f.style.opacity = '1'
      cancelAnimationFrame(raf); track()
    }
    const out = () => { ring(false); release() } // pointer left the page
    window.addEventListener('pointermove', move, { passive: true })
    root.addEventListener('pointerleave', out)
    return () => { ring(false); cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', out) }
  }, [enabled, gx0, gy0])

  if (!enabled) return null
  return (
    <>
      <motion.div aria-hidden style={{ x: gx, y: gy, background: 'radial-gradient(closest-side, color-mix(in oklab, var(--accent) 12%, transparent), transparent)' }}
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-[200px] -mt-[200px] h-[400px] w-[400px] rounded-full will-change-transform" />
      <div ref={frame} aria-hidden data-cursor-frame style={{ opacity: 0 }}
        className="cursor-frame pointer-events-none fixed left-0 top-0 z-[90] h-6 w-6 rounded-full border border-[color-mix(in_oklab,var(--accent)_70%,transparent)] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--accent)_55%,transparent),inset_0_0_12px_-6px_var(--accent)]" />
    </>
  )
}
