import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { profile } from '@/content/profile'

/** Token classes — a tiny hand-rolled "syntax highlighter" (VS Code Dark+ inspired, theme-aware via accent). */
const C = {
  kw: 'text-[#c586c0]', ty: 'text-[#4ec9b0]', fn: 'text-[#dcdcaa]', str: 'text-[#ce9178]',
  key: 'text-[#9cdcfe]', pun: 'text-slate-400', cm: 'text-[var(--comment)] italic', plain: 'text-slate-200',
}
type Tok = [keyof typeof C, string]

function buildCode(): Tok[][] {
  const s = (v: string): Tok => ['str', `"${v}"`]
  return [
    [['kw', 'import'], ['plain', ' { '], ['ty', 'Engineer'], ['plain', ' } '], ['kw', 'from'], ['plain', ' '], s('@hust/math-cs'), ['pun', ';']],
    [],
    [['kw', 'const'], ['plain', ' '], ['key', profile.handle], ['plain', ' = '], ['kw', 'new'], ['plain', ' '], ['ty', 'Engineer'], ['pun', '({']],
    [['plain', '  '], ['key', 'name'], ['pun', ': '], s(profile.name), ['pun', ',']],
    [['plain', '  '], ['key', 'role'], ['pun', ': '], s('Full-stack Developer'), ['pun', ',']],
    [['plain', '  '], ['key', 'company'], ['pun', ': '], s('ELCOM'), ['pun', ',']],
    [['plain', '  '], ['key', 'stack'], ['pun', ': ['], s('.NET'), ['pun', ', '], s('React'), ['pun', ', '], s('gRPC'), ['pun', ', '], s('AWS'), ['pun', '],']],
    [['plain', '  '], ['key', 'mission'], ['pun', ': '], s('code → cloud → architecture'), ['pun', ',']],
    [['pun', '});']],
    [],
    [['key', profile.handle], ['pun', '.'], ['fn', 'deploy'], ['pun', '();'], ['plain', ' '], ['cm', '// 🚀 scroll to run']],
  ]
}

/** Editor window whose code types itself, then "compiles". */
export function CodeEditor({ delay = 900 }: { delay?: number }) {
  const lines = useMemo(buildCode, [])
  const total = useMemo(() => lines.reduce((a, l) => a + l.reduce((b, t) => b + [...t[1]].length, 0) + 1, 0), [lines])
  const [n, setN] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(total); return }
    let id = 0
    const t0 = setTimeout(() => { id = window.setInterval(() => setN((v) => (v >= total ? (clearInterval(id), v) : v + 4)), 32) }, delay) // same typing speed, half the renders
    return () => { clearTimeout(t0); clearInterval(id) }
  }, [total, delay])

  let budget = n
  const done = n >= total
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0e14]/90 shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)] backdrop-blur-xl" data-clip-ok>
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 rounded-t-md border-x border-t border-white/10 bg-[#0b0e14] px-2.5 py-0.5 font-mono text-[11px] text-slate-300">whoami.ts</span>
        <span className="ml-auto font-mono text-[10px] text-slate-400">TypeScript</span>
      </div>
      <pre className="overflow-x-auto px-0 py-2.5 font-mono text-[11px] leading-[1.6] sm:text-[12.5px]">
        {lines.map((line, li) => {
          const chars = line.reduce((b, t) => b + [...t[1]].length, 0)
          const show = Math.max(0, Math.min(chars, budget))
          budget -= chars + 1
          let left = show
          // Rows not reached yet still render (empty) so the editor keeps its final height — no layout shift while typing.
          const visible = budget + chars + 1 > 0 || li === 0
          return (
            <div key={li} className={`flex${visible ? '' : ' invisible'}`} aria-hidden={visible ? undefined : true}>
              <span className="w-9 shrink-0 select-none pr-3 text-right text-slate-500">{li + 1}</span>
              <span className="whitespace-pre">
                {line.map(([cls, txt], ti) => {
                  const g = [...txt]
                  const part = g.slice(0, Math.max(0, left)).join('')
                  left -= g.length
                  return part ? <span key={ti} className={C[cls]}>{part}</span> : null
                })}
                {!done && show < chars && show > 0 && <span className="caret text-[var(--accent)]">▌</span>}
              </span>
            </div>
          )
        })}
      </pre>
      <motion.div initial={false} animate={{ opacity: done ? 1 : 0 }} className="flex items-center gap-3 border-t border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] sm:text-[11px]">
        <span className="text-emerald-400">✓ compiled successfully</span>
        <span className="text-slate-400">0 errors · 0 warnings · 0.42s</span>
      </motion.div>
    </div>
  )
}
