import { useEffect, useRef, useState } from 'react'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEF'

/** "Decode" effect: characters resolve from random glyphs, left → right. */
export function ScrambleText({ text, duration = 700 }: { text: string; duration?: number }) {
  const [out, setOut] = useState(text)
  const raf = useRef(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setOut(text); return }
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const solved = Math.floor(p * text.length)
      let s = text.slice(0, solved)
      for (let i = solved; i < text.length; i++) s += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      setOut(s)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [text, duration])
  return <span><span className="sr-only">{text}</span><span aria-hidden>{out}</span></span>
}
