import { lazy, Suspense, useEffect, useState } from 'react'
import { Navbar } from '@/layout/Navbar'
import { Footer } from '@/layout/Footer'
import { Hero } from '@/features/hero/Hero'
import { About } from '@/features/about/About'
import { Journey } from '@/features/journey/Journey'
import { Experience } from '@/features/experience/Experience'
import { Projects } from '@/features/projects/Projects'
import { Skills } from '@/features/skills/Skills'
import { Contact } from '@/features/contact/Contact'
import { CloudArchitecture } from '@/features/architecture/CloudArchitecture'
import { BootLoader } from '@/layout/BootLoader'
import { CursorGlow } from '@/layout/CursorGlow'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { StatusBar } from '@/layout/StatusBar'
import { ChapterCommand } from '@/components/code/ChapterCommand'
import { chapters } from '@/content/story'
import { UfoGuide } from '@/features/ufo/UfoGuide'

const Terminal = lazy(() => import('@/features/terminal/Terminal').then((m) => ({ default: m.Terminal })))

export function App() {
  const [term, setTerm] = useState(false)
  useSmoothScroll()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT'
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setTerm((v) => !v) }
      else if (e.key === '`' && !typing) { e.preventDefault(); setTerm(true) }
    }
    window.addEventListener('keydown', onKey)
    console.log('%c👋 Hey dev! Press Ctrl+K and type "help".', 'color:#22d3ee;font-size:14px')
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const open = () => setTerm(true)
  return (
    <div className="grain">
      <div className="aurora" aria-hidden><div className="stars s1" /><div className="stars s2" /><div className="stars s3" /><span /><span /></div>
      <BootLoader />
      <CursorGlow />
      <UfoGuide />
      <Navbar onOpenTerminal={open} />
      <main>
        <Hero onOpenTerminal={open} />
        <ChapterCommand chapter={chapters.about} />
        <About />
        <ChapterCommand chapter={chapters.cloud} />
        <CloudArchitecture />
        <ChapterCommand chapter={chapters.journey} />
        <Journey />
        <ChapterCommand chapter={chapters.experience} />
        <Experience />
        <ChapterCommand chapter={chapters.projects} />
        <Projects />
        <ChapterCommand chapter={chapters.skills} />
        <Skills />
        <ChapterCommand chapter={chapters.contact} />
        <Contact />
      </main>
      <Footer />
      <StatusBar />
      <Suspense fallback={null}>{term && <Terminal open={term} onClose={() => setTerm(false)} />}</Suspense>
    </div>
  )
}
