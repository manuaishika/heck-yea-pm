import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const quiz = JSON.parse(readFileSync(join(dataDir, 'quiz.json'), 'utf8')).questions

test.describe('quiz feedback', () => {
  test('a wrong pick turns red, the right answer turns green', async ({ page }) => {
    await page.goto('/skills/assess')
    const q = quiz[0]
    const wrong = (q.answer + 1) % q.options.length
    const options = page.locator('main ul button')
    await options.nth(wrong).click()
    await expect(options.nth(q.answer)).toHaveCSS('background-color', 'rgb(31, 122, 77)')
    await expect(options.nth(wrong)).toHaveCSS('background-color', 'rgb(179, 38, 30)')
  })

  test('a right pick turns green and nothing is red', async ({ page }) => {
    await page.goto('/skills/assess')
    const q = quiz[0]
    const options = page.locator('main ul button')
    await options.nth(q.answer).click()
    await expect(options.nth(q.answer)).toHaveCSS('background-color', 'rgb(31, 122, 77)')
    for (let i = 0; i < q.options.length; i++) {
      if (i !== q.answer) await expect(options.nth(i)).not.toHaveCSS('background-color', 'rgb(179, 38, 30)')
    }
  })
})

test.describe('phone layout', () => {
  test.use({ viewport: { width: 360, height: 800 } })

  test('the loop you run: no step name is clipped', async ({ page }) => {
    await page.goto('/role')
    const tiles = page.getByRole('button', { name: /^(Learn|Decide|Spec|Ship|Align)$/ })
    await expect(tiles).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      const fits = await tiles.nth(i).evaluate((el) => el.scrollWidth <= el.clientWidth)
      expect(fits, `tile ${i} clips its text`).toBe(true)
    }
  })

  test('the footer is compact on a phone', async ({ page }) => {
    await page.goto('/about')
    const box = await page.locator('footer').boundingBox()
    expect(box!.height).toBeLessThan(620)
  })
})
