import { motion, useScroll, useTransform } from 'motion/react'
import { KineticText } from '@/components/motion/KineticText'
import { ScrambleText } from '@/components/motion/ScrambleText'
import { Magnetic } from '@/components/motion/Magnetic'
import { OrgLogo } from '@/components/ui/OrgLogo'
import { CodeEditor } from '@/components/code/CodeEditor'
import { ArrowRight, MapPin, Terminal } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { profile } from '@/content/profile'
import { useI18n } from '@/i18n/I18nProvider'
import { useGreeting } from '@/hooks/useGreeting'
import { hasWebGL } from '@/three/device'
import { useInView } from '@/three/useInView'
import { NetworkCanvas } from './NetworkCanvas'

const GlobeScene = lazy(() => import('./GlobeScene'))
const webgl = typeof window !== 'undefined' && hasWebGL()
const ease = [0.22, 1, 0.36, 1] as const

export function Hero({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const { t, tr } = useI18n()
  const greet = useGreeting()
  const [i, setI] = useState(0)
  // Reveal the scene only once the canvas has its real size, so the globe never jumps into place.
  const [sceneReady, setSceneReady] = useState(!webgl)
  const ref = useRef<HTMLElement>(null)
  const heroVisible = useInView(ref)
  // fetch + parse the 3D chunk after the page has loaded and the browser is idle, so the text paints and responds first
  const [loadGlobe, setLoadGlobe] = useState(false)
  useEffect(() => {
    if (!webgl) return
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void }
    let id = 0, t = 0
    const go = () => {
      if (w.requestIdleCallback) id = w.requestIdleCallback(() => setLoadGlobe(true), { timeout: 1500 })
      else t = window.setTimeout(() => setLoadGlobe(true), 300)
    }
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
    return () => { window.removeEventListener('load', go); if (id) w.cancelIdleCallback?.(id); clearTimeout(t) }
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % profile.rotatingTitles.length), 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="top" ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden">
      <motion.div style={{ y: sceneY }} initial={{ opacity: 0 }} animate={{ opacity: sceneReady ? 1 : 0 }} transition={{ duration: 1.4, ease }} className="absolute inset-0">
        {webgl ? (loadGlobe && <Suspense fallback={null}><GlobeScene onReady={() => setSceneReady(true)} active={heroVisible} /></Suspense>) : <NetworkCanvas />}
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,var(--bg)_0%,color-mix(in_oklab,var(--bg)_70%,transparent)_38%,transparent_62%)] lg:block" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />

      <motion.div style={{ y: textY, opacity: fade }} className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-14 sm:px-6 lg:px-8 lg:pb-16">
        <div className="max-w-2xl lg:max-w-[52%]">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-[11px] text-muted backdrop-blur sm:text-xs">
            {profile.available && (
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
            )}
            {t(greet.time)}, {t(greet.visit)}
          </motion.p>

          <h1 className="font-extrabold leading-[0.92] tracking-[-0.045em]">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}
              className="mb-4 block text-lg font-medium tracking-normal text-muted sm:text-xl">{t('hero.greeting')}</motion.span>
            <KineticText
              text={profile.nameShort}
              className="block pt-[0.08em] text-[clamp(2.6rem,7vw,5rem)] leading-[1.08]"
              charClass={(wi) => (wi === 2 ? 'text-gradient -my-[0.2em] -mx-[0.06em] py-[0.2em] px-[0.06em]' : '')}
              delay={0.2}
            />
          </h1>

          {/* Fixed single line: the scramble effect briefly lengthens the text and must never wrap/reflow the hero. */}
          <p className="mt-5 h-[1.6em] overflow-hidden whitespace-nowrap font-mono text-[clamp(12px,3.6vw,16px)] font-medium sm:text-xl" aria-live="off">
            <span className="text-accent">&gt;_ </span><ScrambleText text={tr(profile.rotatingTitles[i])} />
            <span className="caret ml-0.5 text-accent">▌</span>
          </p>


          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7, ease }}
            className="mt-6 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href="#projects" className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3.5 font-semibold text-[var(--on-accent)] shadow-[0_0_40px_-8px_var(--accent)] transition-shadow hover:shadow-[0_0_70px_-4px_var(--accent)]">
                {t('hero.cta')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3.5 font-semibold backdrop-blur transition hover:border-accent/60">
                {t('hero.contact')}
              </a>
            </Magnetic>
            <button onClick={onOpenTerminal} className="inline-flex items-center gap-2 rounded-full px-3 py-3 font-mono text-sm text-muted transition hover:text-accent">
              <Terminal className="h-4 w-4" /> {t('hero.terminal')} <kbd className="hidden rounded border border-border px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
            </button>
          </motion.div>

          <span className="sr-only">{tr(profile.tagline)}</span>
          <motion.div initial={{ opacity: 0, y: 24, rotateX: 12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.6, duration: 0.9, ease }}
            className="mt-7 max-w-xl [perspective:1000px]">
            <CodeEditor delay={1100} />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted">
              <MapPin className="h-3.5 w-3.5 text-accent" />{tr(profile.location)} ·
              <OrgLogo logo={profile.companyLogo} alt={profile.company} className="ml-1 h-3.5 w-[72px] shrink-0" />
            </span>
          </motion.div>
        </div>
      </motion.div>

      <a href="#about" aria-label={t('hero.scroll')} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted lg:flex">
        {t('hero.scroll')}
        <span className="flex h-9 w-5 justify-center rounded-full border border-border pt-1.5">
          <motion.span animate={heroVisible ? { y: [0, 10, 0] } : { y: 0 }} transition={{ repeat: heroVisible ? Infinity : 0, duration: 1.6 }} className="h-1.5 w-1 rounded-full bg-accent" />
        </span>
      </a>
    </section>
  )
}
