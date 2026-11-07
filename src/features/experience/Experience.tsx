import { Award, Briefcase, GraduationCap } from 'lucide-react'
import { profile } from '@/content/profile'
import { useI18n } from '@/i18n/I18nProvider'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'
import { SpotlightCard, Tag } from '@/components/ui/SpotlightCard'
import { OrgLogo } from '@/components/ui/OrgLogo'

export function Experience() {
  const { t, tr } = useI18n()
  return (
    <Section id="experience" index={4} file="docker-compose.yml" kicker={t('exp.kicker')} title={t('exp.title')}>
      <div className="space-y-5">
        {profile.experience.map((e, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <SpotlightCard className="grid gap-4 p-6 md:grid-cols-[200px_1fr] md:p-8">
              <div>
                {e.logo && (
                  <div className="mb-4 flex h-14 w-full max-w-[180px] items-center rounded-xl border border-border bg-surface px-3">
                    <OrgLogo logo={e.logo} alt={e.company} className="h-7 w-full object-left" />
                  </div>
                )}
                <p className="font-mono text-sm text-accent">{e.period}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted"><Briefcase className="h-4 w-4" />{e.company}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{tr(e.title)}</h3>
                <ul className="mt-3 space-y-2 text-muted">
                  {e.points.map((p, j) => (
                    <li key={j} className="flex gap-3"><span className="mt-2.5 h-1 w-3 shrink-0 rounded bg-accent" />{tr(p)}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">{e.tags.map((x) => <Tag key={x}>{x}</Tag>)}</div>
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <SpotlightCard className="flex h-full gap-5 p-6">
              <div className="grid h-20 w-16 shrink-0 place-items-center rounded-xl bg-white p-1.5 shadow-lg">
                <OrgLogo logo={profile.education.logo} alt={profile.education.short} className="h-full w-full" />
              </div>
              <div>
                <p className="flex items-center gap-2 font-mono text-sm text-accent"><GraduationCap className="h-4 w-4" />{profile.education.period}</p>
                <h3 className="mt-1 text-lg font-semibold">{profile.education.school} <span className="text-muted">({profile.education.short})</span></h3>
                <p className="mt-1 text-muted">{tr(profile.education.degree)}</p>
                <p className="mt-2 text-sm text-accent-2">{tr(profile.education.note)}</p>
              </div>
            </SpotlightCard>
          </Reveal>
          <Reveal delay={0.08}>
            <SpotlightCard className="h-full p-6">
              <Award className="mb-3 h-5 w-5 text-accent" />
              <ul className="space-y-3">
                {profile.certs.map((c) => (
                  <li key={c.name}>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-sm text-muted">{c.issuer} · {c.date}</p>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}

