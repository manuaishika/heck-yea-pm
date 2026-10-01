import { test, expect } from '@playwright/test'

test.describe('theme', () => {
  test('follows the system setting when nothing is saved', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await ctx.close()
  })

  test('the toggle switches, remembers the choice and survives a reload', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'light' })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(dark).not.toBe('rgb(255, 255, 255)')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // an explicit choice beats the system setting
    await page.getByRole('button', { name: 'Switch to light mode' }).click()
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await ctx.close()
  })
})
