import { motion } from 'motion/react'
import { blur } from '@/three/device'

const ease = [0.22, 1, 0.36, 1] as const

/**
 * Per-character entrance: rise + de-blur + scale, staggered.
 * Deliberately NO overflow mask → Vietnamese diacritics and descenders are never clipped.
 * Accessible: real text in sr-only, animated glyphs aria-hidden.
 */
export function KineticText({ text, className = '', charClass, delay = 0, stagger = 0.04 }: {
  text: string; className?: string; charClass?: (wordIndex: number) => string; delay?: number; stagger?: number
}) {
  let n = 0
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline">
        {text.split(' ').map((word, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap pr-[0.22em]">
            {[...word].map((ch) => {
              const i = n++
              return (
                <motion.span
                  key={i}
                  className={`inline-block will-change-transform ${charClass?.(wi) ?? ''}`}
                  initial={{ opacity: 0, y: '0.45em', ...blur(12), scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, ...blur(0), scale: 1 }}
                  transition={{ duration: 1, delay: delay + i * stagger, ease }}
                >
                  {ch}
                </motion.span>
              )
            })}
          </span>
        ))}
      </span>
    </span>
  )
}
