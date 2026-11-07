import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/**
 * Two designed themes:
 *  - dark  = "deep space IDE": glow, bloom, starfield (signature, default)
 *  - light = "blueprint": ink lines on paper, solid shadows, no glow
 * Visitors also pick an accent colour.
 */
export type Mode = 'dark' | 'light'
export type Accent = 'aurora' | 'sunset' | 'matrix'
export const ACCENTS: Accent[] = ['aurora', 'sunset', 'matrix']

interface Ctx { mode: Mode; accent: Accent; setMode: (m: Mode) => void; toggleMode: () => void; setAccent: (a: Accent) => void; nextAccent: () => void }
const ThemeContext = createContext<Ctx | null>(null)

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    if (v && (allowed as readonly string[]).includes(v)) return v as T
  } catch { /* ignore */ }
  return fallback
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => read('mode', ['dark', 'light'] as const, 'dark'))
  const [accent, setAccent] = useState<Accent>(() => read('accent', ACCENTS, 'aurora'))
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = mode
    root.dataset.accent = accent
    try { localStorage.setItem('mode', mode); localStorage.setItem('accent', accent) } catch { /* ignore */ }
  }, [mode, accent])
  const value = useMemo<Ctx>(() => ({
    mode, accent, setMode, setAccent,
    toggleMode: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    nextAccent: () => setAccent((a) => ACCENTS[(ACCENTS.indexOf(a) + 1) % ACCENTS.length]),
  }), [mode, accent])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
