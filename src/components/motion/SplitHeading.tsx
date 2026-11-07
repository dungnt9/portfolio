import { motion } from 'motion/react'
import { blur } from '@/three/device'

/** Word-by-word heading entrance on scroll (rise + de-blur + slight rotate). No clipping mask. */
export function SplitHeading({ text, className = '' }: { text: string; className?: string }) {
  return (
    <h2 className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(' ').map((w, i) => (
          <motion.span
            key={`${text}-${i}`}
            className="inline-block pr-[0.25em]"
            initial={{ opacity: 0, y: '0.6em', rotateX: -40, ...blur(8) }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0, ...blur(0) }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.9, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
        ))}
      </span>
    </h2>
  )
}
