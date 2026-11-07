import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { findClippedText, findHorizontalOverflow, findTextOverlaps, open, revealAll, scrollToSection, SECTIONS } from './helpers'

/** The light ("blueprint") theme must meet exactly the same bar as dark. */
test.describe('light theme', () => {
  test('layout: no clipped/overlapping text, no sideways scroll', async ({ page }) => {
    const errors = await open(page, { mode: 'light' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    expect(await findTextOverlaps(page, '#top')).toEqual([])
    await revealAll(page)
    for (const id of SECTIONS) {
      await scrollToSection(page, id, id === 'cloud' ? 0.95 : undefined)
      const clipped = await findClippedText(page)
      expect(clipped, `#${id}: ${JSON.stringify(clipped)}`).toEqual([])
    }
    const o = await findHorizontalOverflow(page)
    expect(o.scroll, `page ${o.width}px on ${o.viewport}px device`).toBe(false)
    expect(errors).toEqual([])
  })

  test('accessibility: WCAG 2.1 AA incl. colour contrast', async ({ page }) => {
    await open(page, { mode: 'light' })
    await revealAll(page)
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).exclude('canvas').analyze()
    const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(bad.map((v) => `${v.id} → ${v.nodes.slice(0, 4).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
  })
})
