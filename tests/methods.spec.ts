import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const methods: { slug: string }[] = JSON.parse(readFileSync(join(dataDir, 'methods.json'), 'utf8')).methods

// Every method diagram plays on its own: no pause or play control, no
// progress line, and the caption moves on without anything being touched.
for (const { slug } of methods) {
  test(`${slug}: diagram moves by itself, with no pause or play control`, async ({ page }) => {
    await page.goto(`/methods/${slug}`)
    await page.waitForLoadState('networkidle')

    const stage = page.locator('main .diagram-enter').last()
    await stage.scrollIntoViewIfNeeded()

    await expect(page.getByRole('button', { name: /^(pause|play)$/i })).toHaveCount(0)

    const caption = stage.locator('.text-section').last()
    const first = await caption.innerText()
    await expect
      .poll(async () => caption.innerText(), { timeout: 6000, message: `${slug} caption never changed` })
      .not.toBe(first)
  })
}
