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
