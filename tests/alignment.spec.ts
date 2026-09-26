import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const load = (name: string) => JSON.parse(readFileSync(join(dataDir, name), 'utf8'))
const questions = load('questions.json')
const companies = load('companies.json').companies
const methods = load('methods.json').methods

const ROUTES = [
  '/',
  '/role',
  '/skills',
  '/skills/assess',
  '/careers',
  '/india',
  '/guesstimates',
  '/resume',
  '/resources',
  '/methods',
  `/methods/${methods[0].slug}`,
  '/browse',
  `/browse/${questions[0].id}`,
  '/companies',
  `/companies/${companies[0].slug}`,
  '/ai',
  '/flashcards',
  '/flashcards/complete',
  '/saved',
  '/about',
  '/login',
  '/directory',
  '/does-not-exist',
]

const WIDTHS = [1440, 1280, 1024, 390]

for (const width of WIDTHS) {
  test.describe(`centring at ${width}px`, () => {
    for (const route of ROUTES) {
      test(`${route} is centred, no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(route)
        await page.waitForLoadState('networkidle')

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement
          return doc.scrollWidth - doc.clientWidth
        })
        expect(overflow, `${route} @ ${width}px has horizontal overflow`).toBeLessThanOrEqual(0)

        const measured = await page.evaluate(() => {
          // PageContainer.jsx is the one shared container — used by both the
          // header's inner row and the content wrapper below it
          const main = document.querySelector('main > div')
          const header = document.querySelector('header > div')
          if (!main) return null
          const r = main.getBoundingClientRect()
          const h = header?.getBoundingClientRect()
          return {
            left: r.left,
            right: window.innerWidth - r.right,
            headerLeft: h?.left ?? null,
          }
        })
        expect(measured, `${route} @ ${width}px: PageContainer not found`).not.toBeNull()
        if (measured) {
          expect(
            Math.abs(measured.left - measured.right),
            `${route} @ ${width}px: left gap ${measured.left} vs right gap ${measured.right}`
          ).toBeLessThanOrEqual(1)
          if (measured.headerLeft !== null) {
            expect(
              Math.abs(measured.headerLeft - measured.left),
              `${route} @ ${width}px: header left ${measured.headerLeft} vs content left ${measured.left}`
            ).toBeLessThanOrEqual(1)
          }
        }
      })
    }
  })
}
