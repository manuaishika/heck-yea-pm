// Records the homepage demo video: land on the homepage -> open Role &
// Skills -> click a donut slice -> scroll through a flowchart -> open a
// question and reveal the full answer -> flip a few flashcards.
//
// Usage: npm run build && npm run preview -- --port 4173 --strictPort &
//        node scripts/record-demo.js
// Re-run any time the site changes and the demo should reflect it. Output:
// public/demo/demo.webm (Playwright's own recorder), transcoded to
// public/demo/demo.mp4, plus public/demo/poster.jpg (first frame).

import { chromium } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync, renameSync, readdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'demo')
const tmpDir = join(root, '.demo-tmp')
const BASE = process.env.DEMO_BASE_URL || 'http://localhost:4173'
const SIZE = { width: 1280, height: 720 }
const ffmpeg = findFfmpeg()

function findFfmpeg() {
  // a real ffmpeg build (with libx264) is required for the MP4 step — an
  // explicit FFMPEG_PATH wins, then whatever's on PATH. Playwright's own
  // bundled ffmpeg (used only as a last-resort fallback) is a stripped-down
  // build for its trace/video recorder: it can write the WebM, but has no
  // libx264 and cannot produce the MP4 or the JPEG poster — if that's all
  // that's found, install a real ffmpeg (e.g. https://www.gyan.dev/ffmpeg/builds/)
  // and either put it on PATH or set FFMPEG_PATH to it.
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH
  return 'ffmpeg'
}

async function main() {
  mkdirSync(outDir, { recursive: true })
  rmSync(tmpDir, { recursive: true, force: true })
  mkdirSync(tmpDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: SIZE,
    recordVideo: { dir: tmpDir, size: SIZE },
  })
  const page = await context.newPage()
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))

  // 1. land on the homepage
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await wait(1200)

  // 2. open Role & Skills — navigate directly rather than depend on the nav's
  // exact desktop-vs-drawer breakpoint at this recording width
  await page.goto(BASE + '/role', { waitUntil: 'networkidle' })
  await wait(900)

  // 3. click a donut slice — the callout card, not the raw SVG wedge (a
  // wedge's bounding-box centre falls in its own empty hole, so a normal
  // click-at-centre misses it; the card is the same slice's click target)
  // the callout card is the only match whose text includes its note line
  // (the SVG wedge has an aria-label instead, and the mobile list is hidden
  // at this width) — filter on that rather than an ambiguous href/class match
  const card = page
    .locator('a[href="/browse?category=behavioral"]:visible')
    .filter({ hasText: 'How you' })
  await card.scrollIntoViewIfNeeded()
  await wait(500)
  await card.hover()
  await wait(700)
  await card.click()
  await page.waitForURL('**/browse*')
  await wait(900)

  // 4. scroll through a flowchart — /skills has 9 of them
  await page.goto(BASE + '/skills', { waitUntil: 'networkidle' })
  await wait(700)
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 420)
    await wait(650)
  }

  // 5. open a question and reveal the full answer
  await page.goto(BASE + '/browse/favorite-product', { waitUntil: 'networkidle' })
  await wait(900)
  const more = page.getByRole('button', { name: /more/i }).first()
  if (await more.count()) {
    await more.scrollIntoViewIfNeeded()
    await more.click()
    await wait(900)
  }

  // 6. flip a few flashcards
  await page.goto(BASE + '/flashcards', { waitUntil: 'networkidle' })
  await wait(700)
  await page.locator('input[type=checkbox]').first().check()
  await page.getByRole('button', { name: /^Start/ }).click()
  await wait(700)
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: /show answer|show question/i }).click()
    await wait(900)
    await page.getByRole('button', { name: /show answer|show question/i }).click()
    await wait(500)
    const known = page.getByRole('button', { name: 'Known' })
    if (await known.count()) await known.click()
    await wait(500)
  }
  await wait(800)

  await context.close()
  await browser.close()

  // Playwright names the file after an internal id — find the one video it wrote
  const webmName = readdirSync(tmpDir).find((f) => f.endsWith('.webm'))
  if (!webmName) throw new Error('no video was recorded')
  const webmPath = join(outDir, 'demo.webm')
  renameSync(join(tmpDir, webmName), webmPath)
  rmSync(tmpDir, { recursive: true, force: true })

  // transcode to MP4 (H.264) and pull a poster frame, both budgeted under 3MB
  const mp4Path = join(outDir, 'demo.mp4')
  const posterPath = join(outDir, 'poster.jpg')
  execFileSync(ffmpeg, [
    '-y', '-i', webmPath,
    '-vcodec', 'libx264', '-crf', '30', '-preset', 'slow',
    '-movflags', '+faststart', '-an',
    mp4Path,
  ])
  // seek a few seconds in — frame 0 is the still-loading blank page
  execFileSync(ffmpeg, ['-y', '-ss', '3', '-i', webmPath, '-vframes', '1', '-q:v', '3', posterPath])

  // if webm itself is over budget, recompress it too (libvpx-vp9, no audio)
  if (statSync(webmPath).size > 3 * 1024 * 1024) {
    const tmp = webmPath + '.tmp.webm'
    execFileSync(ffmpeg, [
      '-y', '-i', webmPath,
      '-vcodec', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-an',
      tmp,
    ])
    rmSync(webmPath)
    renameSync(tmp, webmPath)
  }

  for (const f of ['demo.webm', 'demo.mp4', 'poster.jpg']) {
    const size = statSync(join(outDir, f)).size
    console.log(`${f}: ${(size / 1024 / 1024).toFixed(2)} MB`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
