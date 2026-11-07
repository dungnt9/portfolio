import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { LOW_POWER } from '@/three/device'

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1])
  const blur = useTransform(progress, range, ['blur(4px)', 'blur(0px)'])
  return <motion.span style={LOW_POWER ? { opacity } : { opacity, filter: blur }} className="inline-block pr-[0.25em]">{children}</motion.span>
}

/** Scroll-scrubbed reading reveal: each word brightens as it passes through the viewport (and dims back on scroll up). */
export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>
      ))}
    </p>
  )
}
