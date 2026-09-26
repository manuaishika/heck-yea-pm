// Crawls every internal link on every route and fails on any that lands on
// the app's own NotFound page, or a same-origin URL Playwright can't load.
// Doesn't check *external* links (company sites, program pages) — those are
// out of our control and covered by nothing here.

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
]

test('every internal link on every route resolves, none land on NotFound', async ({ page }) => {
  // a full-site crawl (every route, then every distinct link found on them)
  // takes a lot longer than one page's worth of assertions
  test.setTimeout(300_000)

  // pass 1: visit every route once, collect every same-origin link on it
  const linksByRoute = new Map<string, { href: string; text: string }[]>()
  for (const route of ROUTES) {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    const links = await page.$$eval('a[href]', (as) =>
      as.map((a) => ({ href: a.getAttribute('href') || '', text: (a.textContent || '').trim() }))
    )
    linksByRoute.set(
      route,
      links.filter((l) => l.href.startsWith('/') && !l.href.startsWith('//'))
    )
  }

  // pass 2: every distinct internal path found, visited once
  const byPath = new Map<string, { fromRoute: string; text: string }>()
  for (const [route, links] of linksByRoute) {
    for (const { href, text } of links) {
      const path = href.split('#')[0] || '/'
      if (path && !byPath.has(path)) byPath.set(path, { fromRoute: route, text })
    }
  }

  for (const [path, { fromRoute, text }] of byPath) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    const notFound = await page.locator('[data-testid="not-found"]').count()
    expect.soft(notFound, `${fromRoute} links to "${text}" -> ${path}, which is NotFound`).toBe(0)

    // a link into a company profile should actually land on that company —
    // catches "linked to the wrong slug" as well as outright 404s
    const companyMatch = path.match(/^\/companies\/([^/]+)$/)
    if (companyMatch && notFound === 0) {
      const company = companies.find((c: { slug: string }) => c.slug === companyMatch[1])
      if (company) {
        const heading = await page.getByRole('heading', { level: 1 }).first().textContent()
        expect.soft(
          heading?.trim(),
          `${fromRoute} links to "${text}" -> ${path}, but that page's heading is "${heading}"`
        ).toBe(company.name)
      }
    }
  }
})
