import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { blur } from '@/three/device'

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, ...blur(6) }}
      whileInView={{ opacity: 1, y: 0, ...blur(0) }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
