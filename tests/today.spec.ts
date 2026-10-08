import { test, expect } from '@playwright/test'

// local calendar day n days ago, as YYYY-MM-DD — same rule as dayKey() in the app
const daysAgo = `(n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}`

test.describe('today', () => {
  test('rating the question starts a streak and records the day', async ({ page }) => {
    await page.goto('/today')
    await expect(page.getByText('No streak yet')).toBeVisible()
    await page.getByRole('button', { name: 'Show model answer' }).click()
    await page.getByRole('button', { name: 'Nailed it' }).click()
    await expect(page.getByText('1 day streak')).toBeVisible()
    await expect(page.getByText('Done today')).toBeVisible()
    const days = await page.evaluate(
      `Object.keys(JSON.parse(localStorage.getItem('hyp.viewed.v1')||'{}')).filter(k=>k.startsWith('day.')).map(k=>k.slice(4))`
    )
    expect(days).toEqual([await page.evaluate(`(${daysAgo})(0)`)])
  })

  test('a streak survives until the day is over', async ({ page }) => {
    await page.addInitScript(`(() => {
      const ago = ${daysAgo}
      localStorage.setItem('hyp.viewed.v1', JSON.stringify({ ['day.' + ago(1)]: true, ['day.' + ago(2)]: true }))
    })()`)
    await page.goto('/today')
    await expect(page.getByText('2 day streak')).toBeVisible()
    await expect(page.getByText('Not done today')).toBeVisible()
  })

  test('the quiz counts as practice too', async ({ page }) => {
    await page.goto('/skills/assess')
    await page.locator('main ul button').first().click()
    await page.goto('/today')
    await expect(page.getByText('1 day streak')).toBeVisible()
  })

  test('an interview date turns into a daily target', async ({ page }) => {
    await page.goto('/today')
    const d = new Date()
    d.setDate(d.getDate() + 10)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    await page.locator('#interview-date').fill(iso)
    await expect(page.getByText('10 days left')).toBeVisible()
    await expect(page.getByText(/questions not rated yet/)).toBeVisible()
    await page.reload()
    await expect(page.getByText('10 days left')).toBeVisible()
    await page.getByRole('button', { name: 'Clear' }).click()
    await expect(page.locator('#interview-date')).toBeVisible()
  })

  test('the reminder downloads a daily calendar event', async ({ page }) => {
    await page.goto('/today')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Add to calendar' }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/\.ics$/)
    const stream = await download.createReadStream()
    let body = ''
    for await (const chunk of stream) body += chunk
    expect(body).toContain('RRULE:FREQ=DAILY')
    expect(body).toContain('/today')
  })

  test('the landing page links to it', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Today’s question' }).click()
    await expect(page).toHaveURL(/\/today$/)
  })
})

test.describe('revisit and share', () => {
  test('a question marked needs work comes back on Today', async ({ page }) => {
    await page.addInitScript(`localStorage.setItem('hyp.reviews.v1', JSON.stringify({ 'tell-me-about-yourself': 'review' }))`)
    await page.goto('/today')
    const card = page.getByRole('region', { name: 'Question' }).last()
    await expect(card.getByText('Revisit')).toBeVisible()
    await expect(card.getByText('You marked this needs work.')).toBeVisible()
    await expect(card.getByRole('heading', { level: 2 })).toContainText('Tell me about yourself')
    await card.getByRole('button', { name: 'Show model answer' }).click()
    await card.getByRole('button', { name: 'Nailed it' }).click()
    // rating it swaps the mark and counts as practice, without replacing the card
    await expect(card.getByRole('heading', { level: 2 })).toContainText('Tell me about yourself')
    await expect(page.getByText('1 day streak')).toBeVisible()
    const marks = await page.evaluate(`JSON.parse(localStorage.getItem('hyp.reviews.v1'))`)
    expect(marks['tell-me-about-yourself']).toBe('known')
  })

  test('with nothing to revisit there is one card', async ({ page }) => {
    await page.goto('/today')
    await expect(page.getByRole('region', { name: 'Question' })).toHaveCount(1)
  })

  test('a missed quiz skill brings a weak-spot question', async ({ page }) => {
    // first quiz question (APIs, technical): option 0 is wrong
    await page.addInitScript(`localStorage.setItem('hyp.quiz.v1', JSON.stringify({ answers: { apis: 0 }, at: 1 }))`)
    await page.goto('/today')
    await expect(page.getByText(/Weak spot from the quiz/)).toBeVisible()
  })

  test('sharing offers WhatsApp where there is no share sheet', async ({ page }) => {
    await page.addInitScript(`localStorage.setItem('hyp.viewed.v1', JSON.stringify({ ['day.' + (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') })()]: true }))`)
    await page.addInitScript(`Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })`)
    await page.goto('/today')
    const link = page.getByRole('link', { name: 'Share on WhatsApp' })
    await expect(link).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=.+today/)
  })

  test('sharing uses the share sheet when the phone has one', async ({ page }) => {
    await page.addInitScript(`
      window.__shared = null
      Object.defineProperty(navigator, 'share', { value: (data) => { window.__shared = data; return Promise.resolve() }, configurable: true })
      localStorage.setItem('hyp.viewed.v1', JSON.stringify({ ['day.' + (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') })()]: true }))
    `)
    await page.goto('/today')
    await page.getByRole('button', { name: 'Share your streak' }).click()
    const shared = await page.evaluate(() => (window as any).__shared)
    expect(shared.url).toMatch(/\/today$/)
    expect(shared.text).toContain('Today’s product interview question')
  })
})

test.describe('answer out loud', () => {
  test('without a microphone it is a two-minute timer', async ({ page }) => {
    await page.addInitScript(`Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })`)
    await page.goto('/today')
    const card = page.getByRole('region', { name: 'Question' }).first()
    await card.getByRole('button', { name: 'Answer out loud · 2:00' }).click()
    await expect(card.getByText('Timer only — microphone off')).toBeVisible()
    await expect(card.getByText(/^1:5\d$/)).toBeVisible({ timeout: 4000 })
    await card.getByRole('button', { name: 'Stop' }).click()
    await expect(card.getByRole('button', { name: 'Answer again' })).toBeVisible()
    await expect(card.getByText(/short\. Aim for 1–2 minutes/)).toBeVisible()
  })
})

test.describe('offline', () => {
  test('the site opens with no connection after one visit', async ({ page, context }) => {
    await page.goto('/')
    await page.evaluate(() => navigator.serviceWorker.ready)
    const cached = await page.evaluate(async () => {
      const keys = await caches.keys()
      const cache = await caches.open(keys.find((k) => k.startsWith('pp-'))!)
      return { shell: Boolean(await cache.match('/')), files: (await cache.keys()).length }
    })
    expect(cached.shell).toBe(true)
    expect(cached.files).toBeGreaterThan(40)

    await context.setOffline(true)
    await page.goto('/today')
    await expect(page.getByRole('heading', { level: 1, name: 'Today’s question' })).toBeVisible()
    await page.goto('/browse')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('launch basics', () => {
  test('sitemap lists the public routes and robots.txt points at it', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/today</loc>')
    expect(sitemap).toContain('/browse</loc>')
    expect(sitemap).not.toContain('/login<')
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/)
  })

  test('the manifest opens the app on Today, and the icons exist', async ({ request }) => {
    const manifest = await (await request.get('/manifest.webmanifest')).json()
    expect(manifest.start_url).toContain('/today')
    for (const icon of manifest.icons) expect((await request.get(icon.src)).status()).toBe(200)
    expect((await request.get('/og.png')).status()).toBe(200)
  })

  test('link previews carry the share image', async ({ request }) => {
    const html = await (await request.get('/browse')).text()
    expect(html).toMatch(/og:image" content="https?:\/\/[^"]+\/og\.png"/)
    expect(html).toContain('summary_large_image')
  })
})
