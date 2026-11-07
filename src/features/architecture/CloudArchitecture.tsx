import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Cloud } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { archSteps } from '@/content/architecture'
import { useI18n } from '@/i18n/I18nProvider'
import { blur, hasWebGL } from '@/three/device'
import { useInView } from '@/three/useInView'

const ArchScene = lazy(() => import('./ArchScene'))
const webgl = typeof window !== 'undefined' && hasWebGL()

/** Scrollytelling: a tall track with a sticky 3D stage; scroll progress builds the AWS architecture step by step. */
export function CloudArchitecture() {
  const { t, tr } = useI18n()
  const track = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => setStep(Math.min(archSteps.length - 1, Math.floor(p * (archSteps.length + 0.4)))))
  const s = archSteps[step]
  // Load the 3D chunk only when the section is about a screen away, and render only while it is on screen.
  const near = useInView(track, '100% 0px')
  const visible = useInView(track)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (near) setMounted(true) }, [near])

  return (
    <section id="cloud" ref={track} className="relative h-[520vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {webgl && mounted ? <Suspense fallback={null}><ArchScene progress={scrollYProgress} active={visible} /></Suspense> : null}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/70 lg:bg-gradient-to-r lg:from-bg/90 lg:via-bg/20 lg:to-transparent" />

        <div className="pointer-events-none relative z-20 mx-auto flex h-full max-w-6xl flex-col justify-between px-4 pt-24 pb-8 sm:px-6 lg:justify-center lg:px-8">
          <div className="max-w-md">
            <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-accent"><Cloud className="h-4 w-4" /> // {t('cloud.kicker')}</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t('cloud.title')}</h2>
            <p className="mt-3 hidden text-sm text-muted lg:block">{t('cloud.note')}</p>
          </div>

          <div className="max-w-md lg:mt-10">
            <div className="mb-4 flex gap-1.5">
              {archSteps.map((_, i) => (
                <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                  <motion.span className="block h-full bg-gradient-to-r from-accent to-accent-2" animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
                </span>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 20, ...blur(6) }} animate={{ opacity: 1, y: 0, ...blur(0) }} exit={{ opacity: 0, y: -16, ...blur(6) }} transition={{ duration: 0.45 }}
                className="card p-5 md:p-6">
                <p className="font-mono text-xs text-accent-2">0{step + 1} / 0{archSteps.length}</p>
                <h3 className="mt-1 text-xl font-semibold md:text-2xl">{tr(s.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">{tr(s.desc)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.tags.map((x) => <span key={x} className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted">{x}</span>)}
                </div>
              </motion.div>
            </AnimatePresence>
            <p className="mt-3 font-mono text-[11px] text-muted lg:hidden">↓ {t('cloud.scroll')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

