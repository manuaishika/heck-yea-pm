// Renders the brand images from source:
//   public/icons/icon-192.png, icon-512.png, apple-touch-icon.png  <- public/favicon.svg
//   public/og.png (1200x630 link-preview card)                     <- scripts/brand/og.html
//
// Usage: node scripts/brand/render.mjs   (CHROMIUM_PATH picks a specific Chromium)

import { chromium } from '@playwright/test'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})

const icon = pathToFileURL(join(root, 'public', 'favicon.svg')).href
for (const [file, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.goto(icon)
  await page.screenshot({ path: join(root, 'public', 'icons', file) })
  await page.close()
}

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await og.goto(pathToFileURL(join(here, 'og.html')).href)
await og.evaluate(() => document.fonts.ready)
await og.screenshot({ path: join(root, 'public', 'og.png') })

await browser.close()
console.log('✓ icons and og.png written to public/')
