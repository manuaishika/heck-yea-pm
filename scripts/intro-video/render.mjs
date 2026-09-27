// Renders scripts/intro-video/intro.html into the homepage intro video:
// public/intro/intro.webm (VP9), public/intro/intro.mp4 (H.264, for
// browsers without WebM) and public/intro/poster.jpg.
//
// Usage: node scripts/intro-video/render.mjs
// Needs a real ffmpeg with libx264 on PATH, or FFMPEG_PATH pointing at one.
// Set CHROMIUM_PATH to use a specific Chromium build.
//
// Each frame is drawn by calling the page's render(t) and taking a
// screenshot, so the output is exact and frame-perfect, whatever the
// machine's speed. The page's own files (fonts, logos) are served from
// public/; Google Fonts are fetched with curl, which honours the system's
// proxy and CA settings where a headless browser sometimes doesn't.

import { chromium } from '@playwright/test'
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const outDir = join(root, 'public', 'intro')
const FPS = 30
const SIZE = { width: 1280, height: 720 }
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg'

const TYPES = { '.html': 'text/html', '.otf': 'font/otf', '.png': 'image/png', '.woff2': 'font/woff2' }

const cache = new Map()
function curl(url) {
  if (!cache.has(url)) {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36'
    cache.set(url, execFileSync('curl', ['-sS', '-A', ua, url], { maxBuffer: 1 << 26 }))
  }
  return cache.get(url)
}

async function main() {
  mkdirSync(outDir, { recursive: true })
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  const page = await browser.newPage({ viewport: SIZE })

  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.host === 'intro.local') {
      const file = url.pathname === '/' ? join(here, 'intro.html') : join(root, 'public', url.pathname)
      return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? 'application/octet-stream' })
    }
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.host)) {
      const css = url.host.includes('googleapis')
      return route.fulfill({ body: curl(url.href), contentType: css ? 'text/css' : 'font/woff2' })
    }
    return route.abort()
  })

  await page.goto('http://intro.local/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  const duration = await page.evaluate(() => window.DURATION)
  const frames = Math.round(duration * FPS)

  const enc = spawn(
    ffmpeg,
    ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      join(outDir, 'intro.mp4')],
    { stdio: ['pipe', 'inherit', 'inherit'] }
  )
  const done = new Promise((resolve, reject) => enc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))))

  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.render(t), f / FPS)
    const jpg = await page.screenshot({ type: 'jpeg', quality: 92 })
    if (!enc.stdin.write(jpg)) await new Promise((r) => enc.stdin.once('drain', r))
    if (f % (FPS * 5) === 0) console.log(`  ${(f / FPS).toFixed(0)}s`)
  }
  enc.stdin.end()
  await done

  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', join(outDir, 'intro.mp4'),
    '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', join(outDir, 'intro.webm')])

  // poster: the title card, fully in
  await page.evaluate(() => window.render(3))
  await page.screenshot({ path: join(outDir, 'poster.jpg'), type: 'jpeg', quality: 85 })

  await browser.close()
  console.log(`✓ ${frames} frames → public/intro/intro.webm + intro.mp4`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
