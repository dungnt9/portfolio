import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useRef, useState } from 'react'
import type { Chapter } from '@/content/story'
import { useI18n } from '@/i18n/I18nProvider'
import { profile } from '@/content/profile'

/**
 * Story interstitial: a shell prompt whose command TYPES ITSELF as the reader scrolls,
 * then prints its output — each section of the page is "run" like a program.
 */
export function ChapterCommand({ chapter }: { chapter: Chapter }) {
  const { tr } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 92%', 'start 45%'] })
  const [n, setN] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => setN(Math.round(Math.min(1, p / 0.8) * chapter.cmd.length)))
  const done = n >= chapter.cmd.length
  return (
    <div ref={ref} id={chapter.id} className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 lg:px-8">
      <div className="font-mono text-sm sm:text-base md:text-lg">
        <p className="break-all">
          <span className="text-[var(--prompt)]">{profile.handle}@portfolio</span>
          <span className="text-muted">:</span>
          <span className="text-accent-2">~</span>
          <span className="text-muted">$ </span>
          <span className="sr-only">{chapter.cmd}</span>
          <span aria-hidden className="text-fg">{chapter.cmd.slice(0, n)}</span>
          {!done && <span aria-hidden className="caret text-accent">▌</span>}
        </p>
        <motion.p initial={false} animate={{ opacity: done ? 1 : 0, y: done ? 0 : 6 }} transition={{ duration: 0.4 }} className="mt-1 text-muted">
          {tr(chapter.out)}
        </motion.p>
      </div>
    </div>
  )
}
