import { profile } from '@/content/profile'
import type { Lang } from '@/content/types'
import { scrollToId } from '@/hooks/useSmoothScroll'

/** Command registry — add a new command by adding an entry. Pure functions → easy to test. */
export interface CmdCtx { lang: Lang; setLang: (l: Lang) => void; toggleMode: () => void; close: () => void; clear: () => void }
type Cmd = { desc: string; run: (args: string[], ctx: CmdCtx) => string | void }

const SECTIONS = ['about', 'cloud', 'journey', 'experience', 'projects', 'skills', 'contact']
const go = (id: string, ctx: CmdCtx) => {
  const target = id.toLowerCase()
  if (!SECTIONS.includes(target)) return `unknown section: ${id}. try: ${SECTIONS.join(' ')}`
  ctx.close(); setTimeout(() => scrollToId(target), 150)
}

export const commands: Record<string, Cmd> = {
  help: { desc: 'list commands', run: () => Object.entries(commands).map(([k, v]) => `  ${k.padEnd(14)} ${v.desc}`).join('\n') },
  whoami: { desc: 'who is this guy?', run: (_, c) => `${profile.name} — ${profile.role[c.lang]}\n${profile.tagline[c.lang]}` },
  'kubectl': {
    desc: 'try: kubectl get skills',
    run: (a) => {
      if (a[0] !== 'get' || a[1] !== 'skills') return 'usage: kubectl get skills'
      const rows = profile.skills.map((g) => `${g.group.en.padEnd(14)} Running   ${String(g.items.length).padEnd(6)} ${g.items.slice(0, 3).join(', ')}`)
      return ['NAME           STATUS    ITEMS  SAMPLE', ...rows].join('\n')
    },
  },
  experience: { desc: 'work history', run: (_, c) => profile.experience.map((e) => `[${e.period}] ${e.title[c.lang]} @ ${e.company}`).join('\n') },
  projects: { desc: 'selected projects', run: (_, c) => profile.projects.map((p) => `• ${p.title[c.lang]}  [${p.tags.join(', ')}]`).join('\n') },
  roadmap: { desc: 'career roadmap', run: (_, c) => profile.journey.map((m) => `${m.year}  ${m.status === 'now' ? '▶' : m.status === 'done' ? '✓' : '○'} ${m.title[c.lang]}`).join('\n') },
  contact: { desc: 'how to reach me', run: () => [`email     ${profile.contact.email}`, `linkedin  ${profile.contact.linkedin}`, ...(profile.contact.github ? [`github    ${profile.contact.github}`] : [])].join('\n') },
  goto: { desc: 'goto <section>', run: (a, c) => { if (!a[0]) return `sections: ${SECTIONS.join(' ')}`; return go(a[0], c) } },
  lang: { desc: 'lang en|vi', run: (a, c) => { if (a[0] === 'en' || a[0] === 'vi') { c.setLang(a[0]); return `language → ${a[0]}` } return 'usage: lang en|vi' } },
  theme: { desc: 'toggle dark/light', run: (_, c) => { c.toggleMode(); return 'theme toggled ✨' } },
  sudo: { desc: '???', run: () => 'nice try. permission denied 🔒 (hire me to get root access)' },
  clear: { desc: 'clear screen', run: (_, c) => c.clear() },
  exit: { desc: 'close terminal', run: (_, c) => c.close() },
}

export function execute(input: string, ctx: CmdCtx): string | void {
  const [name, ...args] = input.trim().split(/\s+/)
  if (!name) return
  const cmd = commands[name.toLowerCase()]
  return cmd ? cmd.run(args, ctx) : `command not found: ${name}. type 'help'`
}
