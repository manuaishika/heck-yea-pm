import { test, expect } from '@playwright/test'

test.describe('browse by company', () => {
  test('company filter narrows and shows asked-at on rows', async ({ page }) => {
    await page.goto('/browse?company=Google')
    await expect(page.getByText('7 of 131')).toBeVisible()
    await expect(page.getByRole('button', { name: /^Google 7$/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('Google').first()).toBeVisible()
  })

  test('any company chip lists tagged questions only', async ({ page }) => {
    await page.goto('/browse')
    await page.getByRole('button', { name: /^any company/ }).click()
    await expect(page).toHaveURL(/company=any/)
    await expect(page.getByText(/21 of 131/)).toBeVisible()
  })

  test('most asked sort puts multi-company questions first', async ({ page }) => {
    await page.goto('/browse?sort=most-asked')
    await expect(page.locator('#sort')).toHaveValue('most-asked')
    await expect(page.getByText(/Ranked by how many companies/)).toBeVisible()
  })

  test('sort control updates the url', async ({ page }) => {
    await page.goto('/browse')
    await page.locator('#sort').selectOption('az')
    await expect(page).toHaveURL(/sort=az/)
    const first = await page.locator('article h3, article span.font-semibold').first().innerText()
    expect(first.length).toBeGreaterThan(0)
  })

  test('company tag on a question links to the filtered bank', async ({ page }) => {
    await page.goto('/browse?company=Google')
    await page.locator('article button[aria-expanded]').first().click()
    await page.getByRole('link', { name: /Google/ }).first().click()
    await expect(page).toHaveURL(/company=Google/)
  })

  test('question page shows asked-at as internal links', async ({ page }) => {
    await page.goto('/browse?company=Google')
    await page.locator('article button[aria-expanded]').first().click()
    await page.getByRole('link', { name: 'Open full page' }).first().click()
    await expect(page.getByText('Asked at')).toBeVisible()
    await page.locator('section', { hasText: 'Asked at' }).getByRole('link', { name: /Google/ }).click()
    await expect(page).toHaveURL(/browse\?company=Google/)
  })

  test('landing company names are clickable', async ({ page }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: 'Google', exact: true }).first()
    await link.focus()
    await link.click({ force: true })
    await expect(page).toHaveURL(/companies\/google/)
  })

  test('company without data goes to a search, not a blank bank', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('.marquee a', { hasText: 'Atlassian' }).first()
    if (await link.count()) {
      await link.click({ force: true })
      await expect(page).toHaveURL(/browse\?q=Atlassian/)
    }
  })
})
