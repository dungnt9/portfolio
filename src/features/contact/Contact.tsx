import { Check, Copy, Github, Linkedin, Mail } from 'lucide-react'
import { useState } from 'react'
import { profile } from '@/content/profile'
import { useI18n } from '@/i18n/I18nProvider'
import { Reveal } from '@/components/ui/Reveal'

export function Contact() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.contact.email); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* ignore */ }
  }
  const links = [
    { href: `mailto:${profile.contact.email}`, label: 'Email', Icon: Mail },
    { href: profile.contact.linkedin, label: 'LinkedIn', Icon: Linkedin },
    ...(profile.contact.github ? [{ href: profile.contact.github, label: 'GitHub', Icon: Github }] : []),
  ]
  return (
    <section id="contact" className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="card relative overflow-hidden rounded-3xl p-8 text-center sm:p-14">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_60%)] opacity-15" />
          <p className="relative font-mono text-xs uppercase tracking-[0.25em] text-accent">// {t('contact.kicker')}</p>
          <h2 className="relative mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">{t('contact.title')}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted">{t('contact.desc')}</p>
          <button onClick={copy} className="relative mx-auto mt-8 inline-flex max-w-full items-center gap-3 rounded-full bg-fg px-5 py-3 font-mono text-sm text-bg transition hover:scale-[1.03] sm:text-base">
            <span className="truncate">{profile.contact.email}</span>
            {copied ? <Check className="h-4 w-4 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
            <span className="sr-only">{copied ? t('contact.copied') : t('contact.copy')}</span>
          </button>
          <div className="relative mt-8 flex justify-center gap-3">
            {links.map(({ href, label, Icon }) => (
              <a key={label} href={href} {...(href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noreferrer' })} aria-label={label}
                className="grid h-12 w-12 border border-border bg-surface place-items-center rounded-full transition hover:-translate-y-1 hover:text-accent">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

