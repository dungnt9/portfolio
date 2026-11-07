import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { open, revealAll, scrollToSection } from './helpers'

test('accessibility: no serious/critical WCAG 2.1 AA violations', async ({ page }) => {
  await open(page)
  await revealAll(page)
  const res = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('canvas')
    .analyze()
  const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(bad.map((v) => `${v.id}: ${v.help} (${v.nodes.length}) → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
})

/** Visual regression: pixel-compared against approved baselines (tests/e2e/*-snapshots). 3D canvases are masked (GPU-dependent). */
for (const id of ['top', 'about', 'journey', 'experience', 'projects', 'skills', 'contact']) {
  test(`visual: #${id}`, async ({ page }) => {
    await open(page)
    await revealAll(page)
    await scrollToSection(page, id)
    await expect(page).toHaveScreenshot(`${id}.png`, { mask: [page.locator('canvas'), page.locator('[data-visual-mask]')], stylePath: 'tests/e2e/visual.css' })
  })
}
