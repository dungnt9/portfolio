// Visual QA: screenshots across devices + scroll positions, collects console errors & layout overflow.
// Usage: node tests/visual.mjs [baseUrl] [outDir]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const base = process.argv[2] || 'http://localhost:5173/'
const out = process.argv[3] || 'tests/shots'
mkdirSync(out, { recursive: true })

const devices = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180, touch: true },
  { name: 'mobile', width: 390, height: 844, touch: true },
]
const sections = ['top', 'about', 'cloud@0.1', 'cloud@0.5', 'cloud@0.95', 'journey', 'experience', 'projects', 'skills', 'contact']

const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })
const report = []
for (const d of devices) {
  const ctx = await browser.newContext({ viewport: { width: d.width, height: d.height }, hasTouch: !!d.touch, isMobile: !!d.touch, deviceScaleFactor: 1, reducedMotion: 'no-preference' })
  await ctx.addInitScript((m) => { try { sessionStorage.setItem('booted', '1'); localStorage.setItem('mode', m) } catch {} }, process.env.MODE || 'dark')
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  for (const s of sections) {
    const [id, frac] = s.split('@')
    await page.evaluate(([id, frac]) => {
      const el = document.getElementById(id)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      const y = frac ? top + (el.offsetHeight - innerHeight) * Number(frac) : top - 70
      window.scrollTo({ top: id === 'top' ? 0 : y, behavior: 'instant' })
    }, [id, frac])
    await page.waitForTimeout(1600)
    await page.screenshot({ path: `${out}/${d.name}-${s.replace('@', '_')}.png` })
  }
  const overflow = await page.evaluate(() => {
    const w = document.documentElement.clientWidth
    return [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > w + 1 && getComputedStyle(e).position !== 'fixed' && r.width > 0 })
      .slice(0, 8).map((e) => `${e.tagName}.${String(e.className).slice(0, 60)} right=${Math.round(e.getBoundingClientRect().right)}`)
  })
  const hScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  report.push({ device: d.name, errors: [...new Set(errors)].slice(0, 10), hScroll, overflow })
  await ctx.close()
}
await browser.close()
console.log(JSON.stringify(report, null, 2))

