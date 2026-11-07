import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { profile } from '@/content/profile'
import type { Milestone } from '@/content/types'
import { useI18n } from '@/i18n/I18nProvider'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { commits } from '@/content/story'

function MilestoneCard({ m, i, wide }: { m: Milestone; i: number; wide?: boolean }) {
  const c = commits[i]
  const { t, tr } = useI18n()
  const badge = m.status === 'now' ? t('journey.now') : m.status === 'goal' ? t('journey.goal') : null
  return (
    <div className={`card relative h-full p-6 ${wide ? 'card-solid w-[min(380px,80vw)] shrink-0 md:p-8' : ''} ${m.status === 'goal' ? 'shadow-[0_0_60px_-20px_var(--accent-2)]' : ''}`}>
      <p className="mb-3 font-mono text-xs"><span className="text-amber-400">commit {c?.hash}</span>{m.status === 'now' && <span className="text-accent"> (HEAD → career/main)</span>}</p>
      <div className="flex items-center gap-2">
        <span className="text-gradient font-mono text-3xl font-bold md:text-5xl">{m.year}</span>
        {badge && <span className="rounded-full bg-accent-2/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-2">{badge}</span>}
      </div>
      <h3 className="mt-3 text-xl font-semibold md:text-2xl">{tr(m.title)}</h3>
      <p className="mt-2 text-sm text-muted md:text-base">{tr(m.desc)}</p>
      {c && <p className="mt-4 border-t border-border pt-3 font-mono text-[11px] text-[var(--comment)] md:text-xs">$ git commit -m "{tr(c.msg)}"</p>}
      <span className={`absolute right-5 top-6 h-2.5 w-2.5 rounded-full ${m.status === 'done' ? 'bg-accent' : m.status === 'now' ? 'animate-pulse bg-accent-2' : 'border border-muted'}`} />
    </div>
  )
}

/** Desktop: pinned section, vertical scroll drives a horizontal track. */
function HorizontalJourney() {
  const { t } = useI18n()
  const track = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  useLayoutEffect(() => {
    const measure = () => setDist(Math.max(0, (row.current?.scrollWidth ?? 0) - window.innerWidth + 96))
    measure(); window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })
  const x = useTransform(p, [0, 1], [0, -dist])
  return (
    <section ref={track} className="relative hidden h-[300vh] lg:block">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-8">
          <p className="mb-3 font-mono text-sm text-[var(--comment)]">{'// '}{t('journey.kicker')} · CHANGELOG.md</p>
          <h2 className="text-5xl font-bold leading-[1.15] tracking-[-0.03em]">{t('journey.title')}</h2>
        </div>
        <div className="relative mt-14" data-clip-ok>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />
          <motion.div style={{ scaleX: p }} className="absolute left-0 right-0 top-1/2 h-px origin-left bg-gradient-to-r from-accent to-accent-2" />
          <motion.div ref={row} style={{ x }} className="relative flex gap-6 pl-[max(2rem,calc((100vw-72rem)/2+2rem))] pr-24">
            {profile.journey.map((m, i) => <MilestoneCard key={m.year} m={m} i={i} wide />)}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/** Mobile & tablet: vertical timeline. */
function VerticalJourney() {
  const { t } = useI18n()
  return (
    <div className="lg:hidden">
      <Section id="journey-list" index={3} file="CHANGELOG.md" kicker={t('journey.kicker')} title={t('journey.title')}>
        <ol className="relative space-y-5 border-l border-border pl-6">
          {profile.journey.map((m, i) => (
            <li key={m.year} className="relative">
              <span className="absolute -left-[29px] top-7 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-bg" />
              <Reveal delay={i * 0.04}><MilestoneCard m={m} i={i} /></Reveal>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  )
}

export function Journey() {
  return (
    <div id="journey">
      <HorizontalJourney />
      <VerticalJourney />
    </div>
  )
}
