import { useEffect, useRef } from 'react'
import { useInView } from '@/three/useInView'
import { useTheme } from '@/theme/ThemeProvider'

/**
 * "Living infrastructure" background: nodes (services) drift and connect,
 * packets travel along edges. Pure canvas, no deps, DPR-aware, pauses when the tab is hidden or the canvas is off-screen.
 */
const LABELS = ['EC2', 'S3', 'RDS', 'K8s', 'API', 'React', '.NET', 'Kafka', 'ALB', 'CDN', 'Redis', 'VPC']

export function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const { mode, accent } = useTheme()
  const visible = useInView(ref)
  const visibleRef = useRef(false)
  const resume = useRef<() => void>(() => {})
  useEffect(() => { visibleRef.current = visible; if (visible) resume.current() }, [visible])

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const css = getComputedStyle(document.documentElement)
    const c1 = css.getPropertyValue('--accent').trim()
    const c2 = css.getPropertyValue('--accent-2').trim()
    const fg = css.getPropertyValue('--muted').trim()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0, h = 0, raf = 0
    const mouse = { x: -9999, y: -9999 }
    type N = { x: number; y: number; vx: number; vy: number; r: number; label?: string }
    let nodes: N[] = []
    type P = { a: number; b: number; t: number; s: number }
    let packets: P[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(70, Math.max(24, (w * h) / 22000)))
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: i < LABELS.length ? 3 : 1.6,
        label: i < LABELS.length && w > 640 ? LABELS[i] : undefined,
      }))
      packets = []
    }
    const maxD = () => Math.min(170, w / 6)

    const frame = () => {
      ctx.clearRect(0, 0, w, h)
      const md = maxD()
      for (const n of nodes) {
        if (!reduce) { n.x += n.vx; n.y += n.vy }
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy)
        if (d < 120 && d > 0) { n.x += (dx / d) * 0.8; n.y += (dy / d) * 0.8 }
      }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < md) {
          ctx.globalAlpha = (1 - d / md) * 0.35
          ctx.strokeStyle = c1; ctx.lineWidth = 0.8
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          if (!reduce && packets.length < 18 && Math.random() < 0.0015) packets.push({ a: i, b: j, t: 0, s: 0.008 + Math.random() * 0.012 })
        }
      }
      packets = packets.filter((p) => {
        p.t += p.s
        const a = nodes[p.a], b = nodes[p.b]
        if (!a || !b || p.t > 1 || Math.hypot(a.x - b.x, a.y - b.y) > md) return false
        ctx.globalAlpha = 1; ctx.fillStyle = c2
        ctx.shadowColor = c2; ctx.shadowBlur = 10
        ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * p.t, a.y + (b.y - a.y) * p.t, 2, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
        return true
      })
      for (const n of nodes) {
        ctx.globalAlpha = n.label ? 0.95 : 0.6
        ctx.fillStyle = n.label ? c1 : fg
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill()
        if (n.label) {
          ctx.globalAlpha = 0.55; ctx.fillStyle = fg
          ctx.font = '10px "JetBrains Mono", monospace'
          ctx.fillText(n.label, n.x + 7, n.y + 3)
        }
      }
      ctx.globalAlpha = 1
      raf = visibleRef.current && !document.hidden ? requestAnimationFrame(frame) : 0 // stop when off-screen
    }
    resume.current = () => { if (!raf) raf = requestAnimationFrame(frame) }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top
    }
    const onLeave = () => { mouse.x = mouse.y = -9999 }
    const onVis = () => { cancelAnimationFrame(raf); raf = 0; if (!document.hidden) resume.current() }

    resize(); raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [mode, accent])

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />
}
