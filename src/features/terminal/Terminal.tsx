import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { useTheme } from '@/theme/ThemeProvider'
import { profile } from '@/content/profile'
import { commands, execute } from './commands'

type Line = { kind: 'in' | 'out'; text: string }
const BANNER = `Welcome to ${profile.handle}-shell v1.0 — type 'help' to start.`
const SUGGEST = ['whoami', 'kubectl get skills', 'projects', 'roadmap', 'contact']

export function Terminal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, setLang } = useI18n()
  const { toggleMode } = useTheme()
  const [lines, setLines] = useState<Line[]>([{ kind: 'out', text: BANNER }])
  const [value, setValue] = useState('')
  const [hist, setHist] = useState<string[]>([])
  const [hi, setHi] = useState(-1)
  const input = useRef<HTMLInputElement>(null)
  const body = useRef<HTMLDivElement>(null)

  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 50) }, [open])
  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight }) }, [lines])

  const run = (cmd: string) => {
    const out = execute(cmd, { lang, setLang, toggleMode, close: onClose, clear: () => setLines([]) })
    setLines((l) => (cmd.trim() === 'clear' ? [] : [...l, { kind: 'in', text: cmd }, ...(out ? [{ kind: 'out' as const, text: out }] : [])]))
    if (cmd.trim()) setHist((h) => [cmd, ...h])
    setHi(-1); setValue('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') run(value)
    else if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(hi + 1, hist.length - 1); if (hist[n]) { setHi(n); setValue(hist[n]) } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const n = hi - 1; setHi(n); setValue(n >= 0 ? hist[n] : '') }
    else if (e.key === 'Tab') { e.preventDefault(); const m = Object.keys(commands).find((k) => k.startsWith(value)); if (m) setValue(m) }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-label="Terminal" onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 40, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="flex h-[75svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0b0d12]/95 font-mono text-sm text-slate-200 shadow-2xl sm:h-[520px] sm:rounded-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <button onClick={onClose} aria-label="Close" className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" /><span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-slate-500">{profile.handle}@portfolio: ~</span>
            </div>
            <div ref={body} className="flex-1 overflow-y-auto p-4" onClick={() => input.current?.focus()}>
              {lines.map((l, i) => (
                <pre key={i} className={`whitespace-pre-wrap break-words ${l.kind === 'in' ? 'text-slate-200' : 'mb-2 text-slate-400'}`}>
                  {l.kind === 'in' && <span className="text-[var(--accent)]">❯ </span>}{l.text}
                </pre>
              ))}
              <div className="flex items-center">
                <span className="text-[var(--accent)]">❯&nbsp;</span>
                <input ref={input} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKey}
                  className="flex-1 bg-transparent outline-none" spellCheck={false} autoCapitalize="off" autoComplete="off" aria-label="command" />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-2.5">
              {SUGGEST.map((s) => (
                <button key={s} onClick={() => run(s)} className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400 hover:border-[var(--accent)] hover:text-slate-100">{s}</button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
