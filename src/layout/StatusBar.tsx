import { useScroll, useMotionValueEvent } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { GitBranch, CircleCheck, Bell } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

const FILES: Record<string, string> = {
  top: 'whoami.ts', about: 'README.md', cloud: 'main.tf', journey: 'CHANGELOG.md',
  experience: 'docker-compose.yml', projects: 'projects/', skills: 'package.json', contact: 'contact.sh',
}

/** VS Code–style status bar: branch, problems, current "file" (section), Ln/Col from scroll, language, live clock. */
export function StatusBar() {
  const { lang } = useI18n()
  const { scrollYProgress } = useScroll()
  const lnRef = useRef<HTMLSpanElement>(null)
  const [file, setFile] = useState('whoami.ts')
  const [time, setTime] = useState(() => new Date())
  // written straight to the DOM: a React re-render on every scroll frame is wasted work
  useMotionValueEvent(scrollYProgress, 'change', (p) => { if (lnRef.current) lnRef.current.textContent = `Ln ${Math.max(1, Math.round(p * 2026))}, Col 1` })
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 30_000); return () => clearInterval(id) }, [])
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && FILES[e.target.id] && setFile(FILES[e.target.id])), { rootMargin: '-45% 0px -50% 0px' })
    Object.keys(FILES).forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 hidden h-6 items-center justify-between bg-[color-mix(in_oklab,var(--accent)_85%,#000)] px-3 font-mono text-[11px] text-[var(--on-accent)] md:flex" aria-hidden="true">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />career/main*</span>
        <span className="flex items-center gap-1"><CircleCheck className="h-3 w-3" />0 problems</span>
        <span className="hidden lg:inline">{file}</span>
      </div>
      <div className="flex items-center gap-4">
        <span ref={lnRef}>Ln 1, Col 1</span>
        <span className="hidden lg:inline">UTF-8</span>
        <span>{lang === 'en' ? 'English' : 'Tiếng Việt'}</span>
        <span className="hidden lg:inline">TypeScript React</span>
        <span>{time.toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-GB', { hour: '2-digit', minute: '2-digit' })} · Hanoi</span>
        <Bell className="h-3 w-3" />
      </div>
    </div>
  )
}
