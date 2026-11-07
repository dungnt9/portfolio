import { ArrowUpRight, Sparkles } from 'lucide-react'
import { profile } from '@/content/profile'
import { useI18n } from '@/i18n/I18nProvider'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { SpotlightCard, Tag } from '@/components/ui/SpotlightCard'
import { CameraWall } from './CameraWall'

export function Projects() {
  const { t, tr } = useI18n()
  const [featured, ...rest] = profile.projects
  return (
    <Section id="projects" index={5} file="projects/" kicker={t('proj.kicker')} title={t('proj.title')}>
      <Reveal>
        <SpotlightCard className="group grid gap-8 overflow-hidden p-6 md:p-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative">
            <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent"><Sparkles className="h-3 w-3" />{t('proj.featured')}</span>
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">{tr(featured.title)}</h3>
            <p className="mt-3 leading-relaxed text-muted">{tr(featured.summary)}</p>
            <div className="mt-5 space-y-3">
              {featured.challenge && <div className="border-l-2 border-accent-2 pl-4"><p className="font-mono text-[11px] uppercase tracking-wider text-accent-2">{t('proj.challenge')}</p><p className="mt-0.5 text-sm">{tr(featured.challenge)}</p></div>}
              {featured.solution && <div className="border-l-2 border-accent pl-4"><p className="font-mono text-[11px] uppercase tracking-wider text-accent">{t('proj.solution')}</p><p className="mt-0.5 text-sm">{tr(featured.solution)}</p></div>}
            </div>
            <div className="mt-6 flex flex-wrap gap-1.5">{featured.tags.map((x) => <Tag key={x}>{x}</Tag>)}</div>
          </div>
          <div className="relative transition-transform duration-700 group-hover:scale-[1.02] lg:[transform:perspective(1200px)_rotateY(-8deg)_rotateX(4deg)] lg:group-hover:[transform:perspective(1200px)_rotateY(-2deg)_rotateX(1deg)]">
            <div aria-hidden className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-accent/25 to-accent-2/25 blur-2xl" />
            <CameraWall />
          </div>
        </SpotlightCard>
      </Reveal>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.08}>
            <SpotlightCard className="group flex h-full flex-col p-6 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-accent">0{i + 2}</p>
                  <h3 className="mt-1 text-xl font-semibold">{tr(p.title)}</h3>
                </div>
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" aria-label="Open" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border transition group-hover:border-accent group-hover:bg-accent group-hover:text-[var(--on-accent)]">
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="mt-3 text-muted">{tr(p.summary)}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-6">{p.tags.map((x) => <Tag key={x}>{x}</Tag>)}</div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
