import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isLowPower } from '@/three/device'
import { Ufo } from './Ufo'
import { WAYPOINTS, type Pose } from './waypoints'

interface Track { input: number[]; x: number[]; y: number[]; s: number[]; o: number[]; beams: { from: number; to: number; section: string }[] }

const ARRIVE = 0.35 // section top at 35% of the viewport = "arrived"
const BEAM_WINDOW = 0.28 // beam stays on within ±28% of a viewport around a beam waypoint

/** Measure section offsets and turn the flight plan into scroll → pose keyframes (px). */
function buildTrack(): Track | null {
  const vw = window.innerWidth, vh = window.innerHeight
  const desktop = vw >= 1024
  const rows: { at: number; p: Pose; fade: boolean; beam: boolean; section: string }[] = []
  for (const w of WAYPOINTS) {
    const el = document.getElementById(w.section)
    if (!el) continue
    const r = el.getBoundingClientRect()
    const top = r.top + window.scrollY
    const span = Math.max(0, r.height - vh * (1 - ARRIVE))
    const at = Math.max(0, top - vh * ARRIVE + w.at * span)
    rows.push({ at: w.section === 'top' ? 0 : at, p: desktop ? w.d : w.m, fade: !!w.fade, beam: !!w.beam, section: w.section })
  }
  if (rows.length < 2) return null
  rows.sort((a, b) => a.at - b.at)
  // motion needs strictly increasing input
  for (let i = 1; i < rows.length; i++) if (rows[i].at <= rows[i - 1].at) rows[i].at = rows[i - 1].at + 1
  return {
    input: rows.map((r) => r.at),
    x: rows.map((r) => (r.p.x / 100) * vw),
    y: rows.map((r) => (r.p.y / 100) * vh),
    s: rows.map((r) => r.p.s),
    o: rows.map((r) => (r.fade ? 0.55 : 1)),
    beams: rows.flatMap((r, i) => {
      if (!r.beam) return []
      const win = vh * BEAM_WINDOW
      const next = rows[i + 1]
      const to = next && next.beam && next.section === r.section ? next.at : r.at + win
      return [{ from: r.at - win, to, section: r.section }]
    }),
  }
}

/** The guide: one fixed, pointer-transparent layer that flies the probe through the page. */
export function UfoGuide() {
  const [track, setTrack] = useState<Track | null>(null)
  const [beam, setBeam] = useState(false)
  const low = useMemo(() => isLowPower(), [])
  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const { scrollY } = useScroll()

  useEffect(() => {
    if (reduced) return
    let raf = 0
    const measure = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setTrack(buildTrack())) }
    measure()
    // sections grow as lazy content mounts → re-measure on any page-height change
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [reduced])

  const rawX = useMotionValue(0), rawY = useMotionValue(0), rawS = useMotionValue(1), opacity = useMotionValue(1)
  // spring = organic acceleration / deceleration between destinations
  const x = useSpring(rawX, { stiffness: 55, damping: 18, mass: 1.1 })
  const y = useSpring(rawY, { stiffness: 55, damping: 18, mass: 1.1 })
  const scale = useSpring(rawS, { stiffness: 60, damping: 20 })
  // bank into the turn: tilt follows horizontal velocity
  const vx = useVelocity(x)
  const rotate = useSpring(useTransform(vx, [-1600, 0, 1600], [-16, 0, 16], { clamp: true }), { stiffness: 120, damping: 20 })

  // pose from scroll position (piecewise-linear, eased per leg) + beam + "the world reacts"
  const update = useCallback((v: number) => {
    if (!track) return
    const { input: inp } = track
    let i = 0
    while (i < inp.length - 2 && v > inp[i + 1]) i++
    const t0 = Math.min(1, Math.max(0, (v - inp[i]) / (inp[i + 1] - inp[i])))
    const t = t0 * t0 * (3 - 2 * t0) // smoothstep: depart slowly, cruise, arrive slowly
    const lerp = (a: number[]) => a[i] + (a[i + 1] - a[i]) * t
    rawX.set(lerp(track.x)); rawY.set(lerp(track.y)); rawS.set(lerp(track.s)); opacity.set(lerp(track.o))
    const hit = track.beams.find((b) => v >= b.from && v <= b.to) ?? null
    const on = !!hit
    if (on !== beam) setBeam(on)
    const lit = document.querySelector('[data-ufo-lit]')
    if (hit && lit?.id !== hit.section) { lit?.removeAttribute('data-ufo-lit'); document.getElementById(hit.section)?.setAttribute('data-ufo-lit', '') }
    else if (!hit && lit) lit.removeAttribute('data-ufo-lit')
  }, [track, beam, rawX, rawY, rawS, opacity])
  useMotionValueEvent(scrollY, 'change', update)
  useEffect(() => { update(scrollY.get()) }, [update, scrollY])

  if (reduced || !track) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {/* entrance: swoops in from deep space on first paint */}
      <motion.div initial={{ opacity: 0, x: '30vw', y: '-30vh', scale: 0.2 }} animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        transition={{ duration: 2.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
        <motion.div style={{ x, y, scale, rotate, opacity }} className="absolute left-0 top-0 -ml-[100px] -mt-[60px] will-change-transform">
          <div className="ufo-hover"><Ufo beam={beam} lowPower={low} /></div>
        </motion.div>
      </motion.div>
    </div>
  )
}
