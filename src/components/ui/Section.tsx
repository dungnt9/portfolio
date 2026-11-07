import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { SplitHeading } from '../motion/SplitHeading'

interface Props { id: string; index?: number; file?: string; kicker: string; title: string; children: ReactNode; className?: string }

/** Section header styled as an editor tab: `01  about.md ×` + kicker comment + big split heading. */
export function Section({ id, index, file, kicker, title, children, className = '' }: Props) {
  return (
    // content-visibility: the browser skips layout/paint of sections far below the fold (big win on phones)
    <section id={id} className={`relative mx-auto w-full max-w-6xl px-4 pt-8 pb-20 [contain-intrinsic-size:auto_1200px] [content-visibility:auto] sm:px-6 md:pb-28 lg:px-8 ${className}`}>
      <Reveal>
        <div className="mb-12 md:mb-16">
          <div className="mb-5 flex items-end gap-0 border-b border-border font-mono text-xs">
            <span className="flex items-center gap-2 rounded-t-lg border-x border-t border-border bg-surface px-3 py-1.5 text-fg">
              {index !== undefined && <span className="text-accent">{String(index).padStart(2, '0')}</span>}
              {file ?? `${id}.md`}
              <span className="text-muted">×</span>
            </span>
          </div>
          <p className="mb-3 font-mono text-xs text-[var(--comment)] sm:text-sm">{'// '}{kicker}</p>
          <SplitHeading text={title} className="max-w-3xl text-3xl font-bold leading-[1.15] tracking-[-0.03em] [perspective:600px] sm:text-4xl md:text-5xl" />
        </div>
      </Reveal>
      {children}
    </section>
  )
}
