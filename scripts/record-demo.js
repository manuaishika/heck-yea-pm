// Records the homepage demo video: three hard-cut beats only --
// open a question -> reveal the full answer -> flip two flashcards.
// No cursor drift, no nav clicks, no menus: each beat is a direct goto
// (an instant cut) plus the one interaction that beat is about.
//
// Usage: npm run build && npm run preview -- --port 4173 --strictPort &
//        node scripts/record-demo.js
// Re-run any time the site changes and the demo should reflect it. Output:
// public/demo/demo.webm / demo.mp4 sped up 1.5x in post (so the ~20s raw
// recording lands at the 12-18s target), plus public/demo/poster.jpg.

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
const SPEED = 1.5
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

  // beat 1: open a question — land straight on it, no browsing to find it
  await page.goto(BASE + '/browse/favorite-product', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await wait(2400)

  // beat 2: reveal the full answer — hard cut is the goto above; this stays
  // on the same page, so the only motion is the reveal itself
  const more = page.getByRole('button', { name: /more/i }).first()
  if (await more.count()) {
    await more.scrollIntoViewIfNeeded()
    await more.click()
  }
  await wait(3200)

  // hard cut — straight to flashcards, no nav, no menu
  await page.goto(BASE + '/flashcards', { waitUntil: 'networkidle' })
  await wait(500)
  await page.locator('input[type=checkbox]').first().check()
  await wait(300)
  await page.getByRole('button', { name: /^Start/ }).click()
  await wait(700)

  // beat 3: flip two flashcards
  await page.getByRole('button', { name: /show answer|show question/i }).click()
  await wait(2600)
  const known = page.getByRole('button', { name: 'Known' })
  if (await known.count()) await known.click()
  await wait(500)
  await page.getByRole('button', { name: /show answer|show question/i }).click()
  await wait(2600)

  await context.close()
  await browser.close()

  // Playwright names the file after an internal id — find the one video it wrote
  const webmName = readdirSync(tmpDir).find((f) => f.endsWith('.webm'))
  if (!webmName) throw new Error('no video was recorded')
  const rawPath = join(tmpDir, webmName)
  const webmPath = join(outDir, 'demo.webm')
  const mp4Path = join(outDir, 'demo.mp4')
  const posterPath = join(outDir, 'poster.jpg')

  // speed up 1.5x (setpts), strip audio, loop-friendly (no fade in/out —
  // a hard cut back to frame 0 is the point), budgeted under 3MB each
  execFileSync(ffmpeg, [
    '-y', '-i', rawPath,
    '-vf', `setpts=PTS/${SPEED}`,
    '-vcodec', 'libx264', '-crf', '28', '-preset', 'slow',
    '-movflags', '+faststart', '-an',
    mp4Path,
  ])
  execFileSync(ffmpeg, [
    '-y', '-i', rawPath,
    '-vf', `setpts=PTS/${SPEED}`,
    '-vcodec', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-an',
    webmPath,
  ])
  // first frame, not frame 0 of the sped-up file — the question is already
  // loaded a beat in, so the poster matches what a viewer actually sees
  execFileSync(ffmpeg, ['-y', '-i', mp4Path, '-vframes', '1', '-q:v', '3', posterPath])

  rmSync(tmpDir, { recursive: true, force: true })

  for (const f of ['demo.webm', 'demo.mp4', 'poster.jpg']) {
    const size = statSync(join(outDir, f)).size
    console.log(`${f}: ${(size / 1024 / 1024).toFixed(2)} MB`)
  }

  // sanity check the final runtime lands in the 12-18s target
  const dur = execFileSync(ffmpeg.replace(/ffmpeg$/, 'ffprobe'), [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1',
    mp4Path,
  ]).toString().trim()
  console.log(`duration: ${dur}s`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
