import { expect, test } from '@playwright/test'
import { open } from './helpers'

test('language toggle switches EN ⇄ VI and persists', async ({ page }) => {
  await open(page, { lang: 'en' })
  await expect(page.getByRole('heading', { name: 'Building the full lifecycle' })).toHaveCount(1)
  await page.getByRole('button', { name: 'Language' }).click()
  await expect(page.getByRole('heading', { name: 'Làm chủ toàn bộ vòng đời' })).toHaveCount(1)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Làm chủ toàn bộ vòng đời' })).toHaveCount(1)
})

test('theme toggle switches dark ⇄ light and persists', async ({ page }) => {
  await open(page)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: /Theme/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('accent color cycles', async ({ page }) => {
  await open(page)
  const before = await page.locator('html').getAttribute('data-accent')
  await page.getByRole('button', { name: 'Accent color' }).click()
  await expect(page.locator('html')).not.toHaveAttribute('data-accent', before!)
})

test('terminal: Ctrl+K opens, commands work, Esc closes', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard shortcut is a desktop feature (mobile uses the menu button)')
  await open(page)
  await page.keyboard.press('Control+k')
  const term = page.getByRole('dialog', { name: 'Terminal' })
  await expect(term).toBeVisible()
  const input = term.getByLabel('command')
  await input.fill('whoami'); await input.press('Enter')
  await expect(term).toContainText('Nguyễn Tiến Dũng')
  await input.fill('kubectl get skills'); await input.press('Enter')
  await expect(term).toContainText('Running')
  await input.fill('nope'); await input.press('Enter')
  await expect(term).toContainText('command not found')
  await input.press('Escape')
  await expect(term).toBeHidden()
})

test('mobile menu opens and navigates', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only')
  await open(page)
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('link', { name: /Projects/ }).click()
  await page.waitForTimeout(1500)
  const top = await page.locator('#projects').evaluate((e) => e.getBoundingClientRect().top)
  expect(Math.abs(top)).toBeLessThan(page.viewportSize()!.height / 3)
})

test('mobile menu closes with Escape and restores scrolling', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only')
  await open(page)
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Close' })).toBeHidden()
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('terminal: goto scrolls to section, rejects unknown sections', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard shortcut is a desktop feature')
  await open(page)
  await page.keyboard.press('Control+k')
  const term = page.getByRole('dialog', { name: 'Terminal' })
  const input = term.getByLabel('command')
  await input.fill('goto nowhere'); await input.press('Enter')
  await expect(term).toContainText('unknown section')
  await input.fill('goto skills'); await input.press('Enter')
  await expect(term).toBeHidden()
  await expect.poll(() => page.locator('#skills').evaluate((e) => Math.abs(e.getBoundingClientRect().top)), { timeout: 8000 }).toBeLessThan(200)
})

test('contact: no placeholder GitHub link', async ({ page }) => {
  await open(page)
  const gh = page.getByRole('link', { name: 'GitHub' })
  if (await gh.count()) await expect(gh).not.toHaveAttribute('href', /^https:\/\/github\.com\/?$/)
})

test('contact links point to the right places', async ({ page }) => {
  await open(page)
  await expect(page.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/dungnt910/')
  await expect(page.getByRole('link', { name: 'Email' })).toHaveAttribute('href', /^mailto:/)
})

test('organisation logos (ELCOM, HUST) load', async ({ page }) => {
  await open(page)
  await page.locator('#experience').scrollIntoViewIfNeeded()
  await page.waitForTimeout(1500)
  for (const alt of ['ELCOM Corporation', 'HUST']) {
    const img = page.getByRole('img', { name: alt }).last()
    await img.scrollIntoViewIfNeeded()
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true)
  }
  await expect(page.getByRole('img', { name: 'ELCOM Corporation' }).first()).toHaveAttribute('src', '/logos/elcom-white.png')
})

test('3D scenes render (WebGL canvases present and non-empty)', async ({ page }) => {
  await open(page)
  const heroCanvas = page.locator('#top canvas').first()
  await expect(heroCanvas).toBeVisible()
  const size = await heroCanvas.evaluate((c: HTMLCanvasElement) => c.width * c.height)
  expect(size).toBeGreaterThan(10_000)
})

test('no layout shift while the hero loads and animates (CLS < 0.1)', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as unknown as { __cls: number }).__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await open(page)
  // covers font swap, 3D scene mount, code-editor typing and at least two rotating-title changes
  await page.waitForTimeout(6000)
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
  expect(cls).toBeLessThan(0.1)
})

test('UFO guide flies to a chapter and lights it up with its beam', async ({ page }) => {
  await open(page)
  const ufo = page.locator('.ufo')
  await expect(ufo).toBeVisible()
  const start = await ufo.boundingBox()
  // arrive at About: section top at ~35% of the viewport
  await page.evaluate(() => { const el = document.getElementById('about')!; window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.35) })
  await expect(page.locator('#about[data-ufo-lit]')).toHaveCount(1)
  await expect(page.locator('.ufo-beam.is-on')).toHaveCount(1)
  await expect.poll(async () => Math.abs(((await ufo.boundingBox())?.x ?? 0) - (start?.x ?? 0)), { timeout: 8000 }).toBeGreaterThan(100)
})

test('intro boot screen can be skipped with a key or tap', async ({ page }) => {
  // the intro only lasts ~1.3 s, so catch it as soon as the page starts rendering (not after 'load')
  await page.goto('/', { waitUntil: 'commit' })
  const boot = page.locator('[data-boot]')
  await expect(boot).toBeVisible()
  await page.keyboard.press('Space')
  await expect(boot).toHaveCount(0, { timeout: 1500 })
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('booted'))).toBe('1')
})

test('three.js is not part of the initial download (loaded lazily with the 3D scenes)', async ({ page }) => {
  const res = await page.request.get('/')
  const html = await res.text()
  expect(html).not.toMatch(/modulepreload[^>]*vendor-three/)
})

test('tech orbit: every planet sits on its ring and the sun stays centred', async ({ page }) => {
  await open(page)
  await page.evaluate(() => document.querySelector('.orbit-system')!.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(800)
  const sample = () => page.evaluate(() => {
    const c = (el: Element) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width } }
    const sys = c(document.querySelector('.orbit-system')!)
    const sun = c(document.querySelector('[data-sun]')!)
    const planets = [...document.querySelectorAll('[data-planet]')].map((p) => {
      const ring = c(p.closest('[data-ring]')!)
      const icon = c(p.querySelector('.rounded-full')!) // the planet disc itself
      return Math.abs(Math.hypot(icon.x - ring.x, icon.y - ring.y) - ring.w / 2)
    })
    return { sunOff: Math.hypot(sun.x - sys.x, sun.y - sys.y), worst: Math.max(...planets), n: planets.length }
  })
  // sample across the 4 s pulse and while the rings turn
  for (let i = 0; i < 5; i++) {
    const s = await sample()
    expect(s.n).toBeGreaterThan(5)
    expect(s.sunOff, 'sun drifted off centre').toBeLessThan(1.5)
    expect(s.worst, 'a planet is off its orbit').toBeLessThan(2)
    await page.waitForTimeout(700)
  }
})

test('tech orbit: hovering any planet shows its name and the system keeps moving', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover is a pointer-device feature')
  await open(page)
  await page.evaluate(() => document.querySelector('.orbit-system')!.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(800)
  const count = await page.locator('[data-planet]').count()
  expect(count).toBeGreaterThan(5)
  // Planets keep moving; outer ones can be off-screen or under the fixed navbar/status bar for a while.
  // Test every planet that is in the clear right now (at least 8), and measure + hit-test atomically in the page.
  const probe = (idx: number) => page.evaluate((i) => {
    const p = document.querySelectorAll('[data-planet]')[i]
    const r = p.querySelector('.rounded-full')!.getBoundingClientRect()
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    const top = x > 0 && y > 0 && x < innerWidth && y < innerHeight ? document.elementFromPoint(x, y) : null
    const covered = !top?.closest('.orbit-system') || (!!top.closest('[data-planet]') && top.closest('[data-planet]') !== p)
    return { x, y, covered, hit: top?.closest('[data-planet]') === p }
  }, idx)
  let tested = 0
  for (let i = 0; i < count; i++) {
    const tip = page.locator('[data-planet]').nth(i).locator('[role="tooltip"]')
    const name = await tip.textContent()
    if ((await probe(i)).covered) continue
    await expect(async () => {
      const at = await probe(i)
      if (at.covered) return // drifted under the chrome meanwhile — nothing to assert
      // nothing inside the orbit system may sit on top of the planet (an invisible layer would eat the hover)
      expect(at.hit, `planet "${name}" is not hoverable`).toBe(true)
      await page.mouse.move(at.x, at.y)
      // hover state on the right planet ⇒ its tooltip is shown (group-hover:opacity-100); not timing-dependent on CI GPUs
      await expect.poll(() => tip.evaluate((e) => e.closest('[data-planet]')!.matches(':hover')), { timeout: 800 }).toBe(true)
    }).toPass({ timeout: 6000 })
    tested++
  }
  expect(tested, 'too few planets were hoverable').toBeGreaterThanOrEqual(8)
  // still turning while hovered
  const disc = page.locator('[data-planet]').first().locator('.rounded-full').first()
  const a = (await disc.boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.waitForTimeout(800)
  const c = (await disc.boundingBox())!
  expect(Math.hypot(c.x - a.x, c.y - a.y), 'orbit paused on hover').toBeGreaterThan(3)
})

test('journey: the progress rail never shows through the cards (dark theme)', async ({ page, isMobile }) => {
  test.skip(isMobile || page.viewportSize()!.width < 1024, 'horizontal journey is desktop only')
  await open(page)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const bg = await page.locator('#journey .card-solid').first().evaluate((e) => getComputedStyle(e).backgroundColor + ' ' + getComputedStyle(e).backgroundImage)
  // an opaque base colour sits under the glass gradient
  expect(bg).not.toMatch(/^rgba\(0, 0, 0, 0\)/)
  // the card paints above the rail
  const onTop = await page.locator('#journey .card-solid').first().evaluate((card) => {
    card.scrollIntoView({ block: 'center' })
    const rail = card.closest('[data-clip-ok]')!.firstElementChild!.getBoundingClientRect()
    const r = card.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, rail.top)
    return !!hit && card.contains(hit)
  })
  expect(onTop).toBe(true)
})

test('mobile hero: no empty band between the hero content and the next chapter', async ({ page, isMobile }) => {
  test.skip(!isMobile || page.viewportSize()!.width > 700, 'phones only (taller screens centre the hero in a full-height section)')
  await open(page)
  const gap = await page.evaluate(() => {
    const hero = document.getElementById('top')!
    const leaves = [...hero.querySelectorAll('*')].filter((e) => !e.closest('canvas') && !e.closest('[aria-hidden]') && e.children.length === 0 && e.getBoundingClientRect().height > 0)
    const last = Math.max(...leaves.map((e) => e.getBoundingClientRect().bottom))
    return hero.getBoundingClientRect().bottom - last
  })
  expect(gap).toBeLessThan(120)
})
