import { motion } from 'motion/react'
import { profile } from '@/content/profile'
import { useI18n } from '@/i18n/I18nProvider'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { TechOrbit } from './TechOrbit'

export function Skills() {
  const { t, tr } = useI18n()
  return (
    <Section id="skills" index={6} file="package.json" kicker={t('skills.kicker')} title={t('skills.title')}>
      <div className="mb-14"><TechOrbit /></div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {profile.skills.map((g, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <SpotlightCard className="h-full p-5">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">{tr(g.group)}</h3>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((s) => <span key={s} className="rounded-lg bg-surface px-2.5 py-1 text-sm">{s}</span>)}
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="card h-full p-6">
            <h3 className="mb-5 font-semibold">{t('skills.learning')}</h3>
            <ul className="space-y-4">
              {profile.learning.map((l) => (
                <li key={l.name}>
                  <div className="mb-1.5 flex justify-between text-sm"><span>{l.name}</span><span className="font-mono text-muted">{l.progress}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${l.progress}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

