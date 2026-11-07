import type { Page } from '@playwright/test'

export const SECTIONS = ['top', 'about', 'cloud', 'journey', 'experience', 'projects', 'skills', 'contact'] as const

/** Skip the intro boot, collect console/page errors. */
export async function open(page: Page, opts: { lang?: 'en' | 'vi'; mode?: 'dark' | 'light' } = {}) {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.addInitScript(({ lang, mode }) => {
    try {
      sessionStorage.setItem('booted', '1')
      // seed only on first load, so reload-persistence tests see the user's own choice
      if (!localStorage.getItem('lang')) localStorage.setItem('lang', lang)
      if (!localStorage.getItem('mode')) localStorage.setItem('mode', mode)
    } catch { /* ignore */ }
  }, { lang: opts.lang ?? 'en', mode: opts.mode ?? 'dark' })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500) // hero intro animations
  return errors
}

/** Scroll to a section (instant) and let reveal animations finish. */
export async function scrollToSection(page: Page, id: string, frac?: number) {
  // Re-apply until the position is stable: lazy content / Lenis can shift layout after the first jump.
  let last = NaN
  for (let attempt = 0; attempt < 6; attempt++) {
    const y = await page.evaluate(([id, frac]) => {
      const el = document.getElementById(id as string)
      if (!el) throw new Error(`missing section #${id}`)
      const top = el.getBoundingClientRect().top + window.scrollY
      const y = id === 'top' ? 0 : frac !== undefined && frac !== null ? top + (el.offsetHeight - innerHeight) * (frac as number) : top - 70
      window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
      return Math.round(y)
    }, [id, frac ?? null] as const)
    await page.waitForTimeout(attempt === 0 ? 1400 : 500)
    const actual = await page.evaluate(() => Math.round(window.scrollY))
    if (y === last && Math.abs(actual - y) <= 2) break
    last = y
  }
}

/** Scroll through the whole page so every whileInView reveal has fired. */
export async function revealAll(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }), y)
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(1200)
}

export interface ClipIssue { text: string; reason: string; tag: string }

/**
 * TEXT-CLIPPING DETECTOR
 * For every visible text node, computes the real glyph ink box (incl. Vietnamese diacritics
 * and descenders, via canvas measureText) and checks it against every ancestor that clips
 * (overflow hidden/clip/auto/scroll). Reports any glyph cut off by its container.
 * Elements can opt out with [data-clip-ok] (e.g. intentional marquees).
 */
export async function findClippedText(page: Page): Promise<ClipIssue[]> {
  return page.evaluate(() => {
    const issues: { text: string; reason: string; tag: string }[] = []
    const ctx = document.createElement('canvas').getContext('2d')!
    const vw = document.documentElement.clientWidth
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const isClipper = (cs: CSSStyleDeclaration) => /(hidden|clip|auto|scroll)/.test(cs.overflowX + cs.overflowY)
    let node: Node | null
    while ((node = walker.nextNode())) {
      const text = (node.textContent ?? '').trim()
      if (!text) continue
      const el = node.parentElement!
      if (el.closest('[data-clip-ok], .sr-only, script, style, canvas, [aria-live]')) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none') continue
      let op = 1
      for (let a: HTMLElement | null = el; a; a = a.parentElement) op *= Number(getComputedStyle(a).opacity)
      if (op < 0.05) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0)
      if (!rects.length) continue
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const m = ctx.measureText(text)
      const fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent
      for (const r of rects) {
        const baseline = r.top + (r.height - (fa + fd)) / 2 + fa
        const ink = { top: baseline - m.actualBoundingBoxAscent, bottom: baseline + m.actualBoundingBoxDescent, left: r.left, right: r.right }
        if (ink.right < 0 || ink.left > vw) continue // off-screen horizontally (e.g. carousels)
        if (ink.bottom < 0 || ink.top > innerHeight) continue // not in the viewport → the user can't see it right now
        for (let a: HTMLElement | null = el; a && a !== document.body; a = a.parentElement) {
          const acs = getComputedStyle(a)
          if (!isClipper(acs)) continue
          const b = a.getBoundingClientRect()
          const tol = 1
          const cut = [
            ink.top < b.top - tol && 'top', ink.bottom > b.bottom + tol && 'bottom',
            ink.left < b.left - tol && 'left', ink.right > b.right + tol && 'right',
          ].filter(Boolean)
          // horizontal truncation with ellipsis is an intended design choice
          if (cut.length && !(acs.textOverflow === 'ellipsis' && cut.every((c) => c === 'left' || c === 'right'))) {
            issues.push({ text: text.slice(0, 40), reason: `clipped ${cut.join('+')} by <${a.tagName.toLowerCase()} class="${String(a.className).slice(0, 50)}">`, tag: el.tagName })
            break
          }
        }
      }
    }
    return issues
  })
}

/** Elements wider than the viewport (cause sideways scrolling on phones). */
export async function findHorizontalOverflow(page: Page) {
  // Compare against the DEVICE width: on mobile, overflowing content silently widens the layout
  // viewport (page zooms out), so scrollWidth === clientWidth would hide the bug.
  const device = page.viewportSize()!.width
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  return { scroll: sw > device + 1 || iw > device + 1, width: Math.max(sw, iw), viewport: device }
}

/** Text blocks that visually overlap other text blocks (e.g. heading under a 3D label). */
export async function findTextOverlaps(page: Page, rootSelector: string) {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel)
    if (!root) return []
    const blocks = [...root.querySelectorAll('h1,h2,h3,p,a,button,li,img')]
      .filter((e) => !e.closest('[aria-hidden="true"], .sr-only, [data-overlap-ok]'))
      .map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter(({ e, r }) => r.width > 0 && r.height > 0 && Number(getComputedStyle(e).opacity) > 0.1 && (e.tagName === 'IMG' || e.textContent!.trim()))
    const out: string[] = []
    for (let i = 0; i < blocks.length; i++) for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i], b = blocks[j]
      if (a.e.contains(b.e) || b.e.contains(a.e)) continue
      const ix = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left)
      const iy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top)
      const n = (e: Element) => e.tagName === 'IMG' ? `<img ${(e as HTMLImageElement).alt}>` : e.textContent!.trim().slice(0, 25)
      if (ix > 4 && iy > 4) out.push(`"${n(a.e)}" ⟂ "${n(b.e)}"`)
    }
    return out
  }, rootSelector)
}
