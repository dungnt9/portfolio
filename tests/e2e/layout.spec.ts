import { expect, test } from '@playwright/test'
import { findClippedText, findHorizontalOverflow, findTextOverlaps, open, revealAll, scrollToSection, SECTIONS } from './helpers'

for (const lang of ['en', 'vi'] as const) {
  test.describe(`layout [${lang}]`, () => {
    test('hero: name fully visible (no clipped diacritics/descenders), nothing overlaps', async ({ page }) => {
      const errors = await open(page, { lang })
      const clipped = await findClippedText(page)
      expect(clipped, JSON.stringify(clipped, null, 2)).toEqual([])
      expect(await findTextOverlaps(page, '#top')).toEqual([])
      // name glyphs must be inside the viewport
      const box = await page.locator('h1').boundingBox()
      const vw = page.viewportSize()!.width
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(vw)
      expect(errors).toEqual([])
    })

    test('every section: no clipped text, no sideways scroll', async ({ page }) => {
      const errors = await open(page, { lang })
      await revealAll(page)
      for (const id of SECTIONS) {
        await scrollToSection(page, id, id === 'cloud' ? 0.95 : undefined)
        const clipped = await findClippedText(page)
        expect(clipped, `#${id}: ${JSON.stringify(clipped, null, 2)}`).toEqual([])
      }
      const o = await findHorizontalOverflow(page)
      expect(o.scroll, `page is ${o.width}px wide on a ${o.viewport}px viewport`).toBe(false)
      expect(errors).toEqual([])
    })

    test('cloud section: step panel never overlaps the title at any step', async ({ page }) => {
      await open(page, { lang })
      for (const f of [0.05, 0.3, 0.5, 0.75, 0.97]) {
        await scrollToSection(page, 'cloud', f)
        expect(await findTextOverlaps(page, '#cloud'), `at progress ${f}`).toEqual([])
      }
    })
  })
}

test('hero is uncluttered: primary CTA visible above the fold', async ({ page }) => {
  await open(page)
  const box = await page.getByRole('link', { name: /View my work/ }).boundingBox()
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height)
})

test('all section anchors exist and are reachable', async ({ page }) => {
  await open(page)
  for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toHaveCount(1)
})
