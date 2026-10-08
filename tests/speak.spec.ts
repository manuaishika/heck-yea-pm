import { test, expect } from '@playwright/test'

// A fake microphone, so the recorder has something to record. Its own file:
// launch flags force a separate browser.
test.use({
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  },
})

test('answer out loud records the answer and plays it back, on the device only', async ({ page, context }) => {
  await context.grantPermissions(['microphone'])
  await page.goto('/today')
  const card = page.getByRole('region', { name: 'Question' }).first()
  await card.getByRole('button', { name: 'Answer out loud · 2:00' }).click()
  await expect(card.getByText('Recording', { exact: true })).toBeVisible()
  await page.waitForTimeout(1500)
  await card.getByRole('button', { name: 'Stop' }).click()
  await expect(card.locator('audio')).toHaveAttribute('src', /^blob:/)
})
