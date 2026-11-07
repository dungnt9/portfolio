import { animate, useInView } from 'motion/react'
import { Compass, GraduationCap, Network, Scale, Target } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { profile } from '@/content/profile'
import { useI18n } from '@/i18n/I18nProvider'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { ScrollWords } from '@/components/motion/ScrollWords'
import { OrgLogo } from '@/components/ui/OrgLogo'

const ICONS = { target: Target, network: Network, scale: Scale, compass: Compass }

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 1.6, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [inView, to])
  return <span ref={ref}>{v.toLocaleString('en-US')}{suffix}</span>
}

export function About() {
  const { t, tr } = useI18n()
  const initials = profile.name.split(' ').map((w) => w[0]).join('')
  return (
    <Section id="about" index={1} file="README.md" kicker={t('about.kicker')} title={t('about.title')}>
      <ScrollWords text={tr(profile.about[1])} className="mb-14 max-w-5xl text-2xl font-semibold leading-snug tracking-tight sm:text-3xl md:text-4xl" />
      <div className="grid gap-4 lg:grid-cols-12">
        <Reveal className="lg:col-span-7 lg:row-span-2">
          <SpotlightCard className="h-full overflow-hidden p-6 sm:p-8">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
            <div className="flex items-center gap-4">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-xl font-extrabold text-[var(--on-accent)] shadow-[0_0_40px_-10px_var(--accent)]">
                {initials}
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-bg bg-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-semibold">{profile.name}</p>
                <p className="text-sm text-muted">{tr(profile.role)}</p>
              </div>
            </div>
            <div className="mt-6 space-y-4 leading-relaxed text-muted sm:text-[17px]">
              <p>{tr(profile.about[0])}</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-sm">
                <span className="grid h-11 w-9 shrink-0 place-items-center rounded-md bg-white p-1"><OrgLogo logo={profile.education.logo} alt="HUST" className="h-full w-full" /></span>
                <span><span className="flex items-center gap-1 font-semibold"><GraduationCap className="h-3.5 w-3.5 text-accent" />{profile.education.short}</span><span className="text-xs text-muted">{tr(profile.education.note)}</span></span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-sm">
                <span className="flex h-11 w-24 shrink-0 items-center"><OrgLogo logo={profile.companyLogo} alt={profile.company} className="h-6 w-full object-left" /></span>
                <span className="text-xs text-muted">{tr(profile.role)}</span>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          {profile.stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <SpotlightCard className="h-full p-5">
                <div className="text-gradient text-3xl font-extrabold tracking-tight sm:text-4xl"><Counter to={s.value} suffix={s.suffix} /></div>
                <div className="mt-1 text-xs text-muted sm:text-sm">{tr(s.label)}</div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          {profile.traits.map((x, i) => {
            const Icon = ICONS[x.icon]
            return (
              <Reveal key={i} delay={0.1 + i * 0.06}>
                <SpotlightCard className="h-full p-5">
                  <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent"><Icon className="h-4.5 w-4.5" /></span>
                  <h3 className="text-sm font-semibold sm:text-base">{tr(x.title)}</h3>
                  <p className="mt-1 text-xs text-muted sm:text-sm">{tr(x.desc)}</p>
                </SpotlightCard>
              </Reveal>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
