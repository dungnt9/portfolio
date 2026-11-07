import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { Menu, Moon, Sun, Terminal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { useTheme } from '@/theme/ThemeProvider'
import type { UiKey } from '@/i18n/ui'
import { profile } from '@/content/profile'
import { setScrollLocked } from '@/hooks/useSmoothScroll'

const NAV: { id: string; key: UiKey }[] = [
  { id: 'about', key: 'nav.about' },
  { id: 'cloud', key: 'nav.cloud' },
  { id: 'journey', key: 'nav.journey' },
  { id: 'experience', key: 'nav.experience' },
  { id: 'projects', key: 'nav.projects' },
  { id: 'skills', key: 'nav.skills' },
  { id: 'contact', key: 'nav.contact' },
]
const SWATCH: Record<string, string> = { aurora: 'from-cyan-400 to-violet-400', sunset: 'from-rose-400 to-amber-400', matrix: 'from-green-400 to-cyan-400' }

function useActiveSection() {
  const [active, setActive] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    NAV.forEach(({ id }) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return active
}

export function Navbar({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const { t, lang, setLang } = useI18n()
  const { mode, toggleMode, accent, nextAccent } = useTheme()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveSection()
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  // motion reads the scroll position once per frame in its batched read phase; reading window.scrollY in our own
  // scroll listener could force a synchronous layout on every scroll event
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 20))
  useEffect(() => { setScrolled(scrollY.get() > 20) }, [scrollY])
  useEffect(() => {
    setScrollLocked(open)
    if (!open) return
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open])

  const iconBtn = 'grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-fg'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div style={{ scaleX: progress }} className="absolute inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-accent to-accent-2" />
      <nav className={`mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all sm:px-4 ${scrolled ? 'glass mx-3 shadow-lg shadow-black/10 sm:mx-6 lg:mx-auto' : 'mx-3 sm:mx-6 lg:mx-auto'}`}>
        <a href="#top" className="px-2 font-mono text-sm font-semibold"><span className="text-accent">~/</span>{profile.handle}</a>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV.map(({ id, key }) => (
            <li key={id}>
              <a href={`#${id}`} className={`relative rounded-full px-3 py-1.5 text-sm transition ${active === id ? 'text-fg' : 'text-muted hover:text-fg'}`}>
                {active === id && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-surface ring-1 ring-border" />}
                {t(key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button onClick={() => setLang(lang === 'en' ? 'vi' : 'en')} className={`${iconBtn} font-mono text-xs font-semibold`} aria-label={`${lang === 'en' ? 'VI' : 'EN'} – Language`}>{lang === 'en' ? 'VI' : 'EN'}</button>
          <button onClick={nextAccent} className={iconBtn} aria-label="Accent color"><span className={`h-4 w-4 rounded-full bg-gradient-to-br ${SWATCH[accent]}`} /></button>
          <button onClick={toggleMode} className={iconBtn} aria-label={mode === 'dark' ? 'Theme: switch to light' : 'Theme: switch to dark'}>{mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <button onClick={onOpenTerminal} className={`${iconBtn} hidden sm:grid`} aria-label="Terminal"><Terminal className="h-4 w-4" /></button>
          <button onClick={() => setOpen(true)} className={`${iconBtn} lg:hidden`} aria-label="Menu"><Menu className="h-5 w-5" /></button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-xl lg:hidden">
            <button onClick={() => setOpen(false)} className={`${iconBtn} absolute right-5 top-5`} aria-label="Close"><X className="h-5 w-5" /></button>
            <ul className="flex h-full flex-col justify-center gap-2 px-8">
              {NAV.map(({ id, key }, i) => (
                <motion.li key={id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <a href={`#${id}`} onClick={() => setOpen(false)} className="block py-2 text-4xl font-bold tracking-tight">
                    <span className="mr-3 font-mono text-sm text-accent">0{i + 1}</span>{t(key)}
                  </a>
                </motion.li>
              ))}
              <li className="pt-6"><button onClick={() => { setOpen(false); onOpenTerminal() }} className="flex items-center gap-2 font-mono text-muted"><Terminal className="h-4 w-4" />terminal</button></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
