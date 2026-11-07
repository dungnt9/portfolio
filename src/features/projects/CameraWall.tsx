import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

/**
 * Animated mock of the VMS live-view dashboard: camera tiles with
 * scan lines, LIVE badges and AI detection boxes that move around.
 * Pure CSS/SVG — no video assets needed. Animations run only while the wall is on screen,
 * and the detection box moves with transforms (no per-frame layout).
 */
const CAMS = ['CAM-01 · Gate A', 'CAM-02 · Lobby', 'CAM-07 · Junction', 'CAM-12 · Parking']
const LABELS = ['car 0.97', 'person 0.93', 'plate 30A-•••', 'truck 0.91', 'motorbike 0.95']

function Tile({ name, seed, live }: { name: string; seed: number; live: boolean }) {
  const [box, setBox] = useState({ x: 20, y: 30, w: 30, h: 28, l: LABELS[seed % LABELS.length] })
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => {
      setBox({ x: 8 + Math.random() * 50, y: 18 + Math.random() * 40, w: 22 + Math.random() * 18, h: 20 + Math.random() * 18, l: LABELS[Math.floor(Math.random() * LABELS.length)] })
    }, 1800 + seed * 400)
    return () => clearInterval(id)
  }, [seed, live])
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#070b14]">
      {/* faux scene */}
      <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(120% 80% at ${30 + seed * 15}% 100%, #1e293b, transparent 60%), linear-gradient(180deg, #0b1222, #0a0f1c)` }} />
      <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-40" style={{ background: 'repeating-linear-gradient(100deg, transparent 0 18px, #334155 18px 19px)' }} />
      <div className="scanline absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent"
        style={{ animationDuration: `${3 + seed}s`, animationPlayState: live ? 'running' : 'paused' }} />
      {/* box is positioned by left/top once per jump (cheap), the glide itself is a transform tween */}
      <motion.div className="absolute rounded-sm border-[1.5px] border-[var(--accent)] shadow-[0_0_12px_var(--accent)]"
        style={{ left: 0, top: 0, width: `${box.w}%`, height: `${box.h}%` }}
        animate={{ x: `${(box.x / box.w) * 100}%`, y: `${(box.y / box.h) * 100}%` }} transition={{ type: 'spring', stiffness: 80, damping: 16 }}>
        <span className="absolute -top-4 left-0 whitespace-nowrap rounded-sm bg-[var(--accent)] px-1 font-mono text-[8px] font-bold text-[var(--on-accent)]">{box.l}</span>
      </motion.div>
      <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-red-500/90 px-1 font-mono text-[8px] font-bold text-white"><span className="h-1 w-1 animate-pulse rounded-full bg-white" />LIVE</span>
      <span className="absolute bottom-1 left-1.5 font-mono text-[8px] text-slate-400">{name}</span>
    </div>
  )
}

export function CameraWall() {
  const ref = useRef<HTMLDivElement>(null)
  const live = useInView(ref)
  const [events, setEvents] = useState(128)
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setEvents((e) => e + 1 + Math.floor(Math.random() * 3)), 1200)
    return () => clearInterval(id)
  }, [live])
  return (
    <div ref={ref} className="relative rounded-xl border border-white/10 bg-[#05070d]/90 p-2.5 shadow-2xl">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500/70" /><span className="h-2 w-2 rounded-full bg-yellow-500/70" /><span className="h-2 w-2 rounded-full bg-green-500/70" /></div>
        <span className="font-mono text-[9px] text-slate-500">vms · live view (demo)</span>
        <span className="font-mono text-[9px] text-emerald-400">● AI {events} events</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {CAMS.map((c, i) => <Tile key={c} name={c} seed={i} live={live} />)}
      </div>
    </div>
  )
}
