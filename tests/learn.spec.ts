import { test, expect, Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const load = (f: string) => JSON.parse(readFileSync(join(dataDir, f), 'utf8'))
const lessons = load('lessons.json').lessons
const cases = load('rca-cases.json').cases
const exercises = load('consumer-exercises.json').exercises
const comps = load('competencies.json')
const events = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('pp.progress.v1') || '[]'))

test.describe('learn', () => {
  test('the library lists every lesson, searches, filters and saves', async ({ page }) => {
    await page.goto('/learn')
    for (const l of lessons) await expect(page.getByRole('link', { name: l.title, exact: true })).toBeVisible()
    await page.getByLabel('Find a concept').fill('funnel')
    await expect(page.getByRole('link', { name: 'Funnels and cohorts' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Jobs to be done' })).toHaveCount(0)
    await page.getByLabel('Find a concept').fill('')
    await page.getByRole('button', { name: /^3 · Analyze$/ }).click()
    await expect(page.getByRole('link', { name: 'Latency, caching and scale' })).toBeVisible()
    await page.getByRole('button', { name: /^3 · Analyze$/ }).click()
    await page.getByRole('button', { name: 'Save Jobs to be done' }).click()
    await page.reload()
    await page.getByRole('button', { name: /^Saved/ }).click()
    await expect(page.getByRole('link', { name: 'Jobs to be done' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Funnels and cohorts' })).toHaveCount(0)
  })

  test('a lesson has the 14 parts, in order', async ({ page }) => {
    await page.goto('/learn/jobs-to-be-done')
    await expect(page.getByRole('heading', { name: /Learning objectives/ })).toBeVisible()
    const heads = await page.locator('main h2').allInnerTexts()
    const names = ['Learning objectives', 'Definition', 'Why it matters', 'How it works', 'Terminology', 'Practical examples', 'Real-world applications', 'Common mistakes', 'Why things fail', 'Trade-offs and limitations', 'Guided exercise', 'Independent exercise', 'Knowledge assessment', 'Suggested next']
    expect(heads.length).toBe(14)
    names.forEach((n, i) => expect(heads[i]).toContain(n))
  })

  test('the check scores, shows why, logs one independent attempt, and sets level 1', async ({ page }) => {
    const l = lessons.find((x: any) => x.slug === 'jobs-to-be-done')
    await page.goto(`/learn/${l.slug}`)
    const box = page.locator('section', { has: page.getByRole('heading', { name: /Knowledge assessment/ }) })
    for (const q of l.assessment) {
      await box.getByRole('button', { name: q.options[q.answer], exact: false }).first().click()
    }
    await expect(box.getByText('3 of 3')).toBeVisible()
    const ev = await events(page)
    expect(ev).toHaveLength(1)
    expect(ev[0]).toMatchObject({ kind: 'lesson-quiz', ref: l.slug, level: 1, score: 1, assisted: false })
    await page.goto('/progress')
    const row = page.getByRole('listitem').filter({ hasText: 'Consumer and user understanding' })
    await expect(row).toContainText('Level 1 · Understand')
  })

  test('the worked steps count as assisted, and assisted work cannot lift a level past 2', async ({ page }) => {
    await page.addInitScript(
      `localStorage.setItem('pp.progress.v1', JSON.stringify([{ t: 1, kind: 'rca', ref: 'x', comps: ['analytics'], level: 3, score: 0.95, assisted: true, self: false }]))`
    )
    await page.goto('/progress')
    await expect(page.getByRole('listitem').filter({ hasText: 'Product analytics' })).toContainText('Level 2 · Apply')
    await page.goto('/learn/metric-decomposition')
    await page.getByRole('button', { name: 'Show the worked steps' }).click()
    const ev = await events(page)
    expect(ev.some((e: any) => e.kind === 'lesson-guided' && e.assisted === true && e.level === 2)).toBe(true)
  })

  test('an independent exercise is scored against its rubric and marked self-rated', async ({ page }) => {
    await page.goto('/learn/jobs-to-be-done')
    const rubric = lessons.find((x: any) => x.slug === 'jobs-to-be-done').independent.rubric
    await page.getByLabel(rubric[0]).check()
    await page.getByLabel(rubric[1]).check()
    await page.getByRole('button', { name: 'Save my score' }).click()
    await expect(page.getByText(/self-rated/)).toBeVisible()
    const ev = await events(page)
    expect(ev.at(-1)).toMatchObject({ kind: 'lesson-independent', self: true, score: 0.5 })
  })

  test('an unknown lesson is not found', async ({ page }) => {
    await page.goto('/learn/not-a-lesson')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('That page does not exist.')
  })
})

test.describe('root cause cases', () => {
  const c = cases.find((x: any) => x.slug === 'food-delivery-orders-drop')
  const cause = c.hypotheses.find((h: any) => h.cause)
  const askAll = async (page: Page, weight: string) => {
    for (const e of c.evidence.filter((x: any) => x.weight === weight)) await page.getByRole('button', { name: e.ask, exact: true }).click()
  }

  test('evidence appears only when asked, and the answer is not revealed before you submit', async ({ page }) => {
    await page.goto(`/practice/rca/${c.slug}`)
    await expect(page.getByText('Nothing yet. Ask a question above.')).toBeVisible()
    const platform = c.evidence.find((e: any) => e.id === 'platform')
    await expect(page.getByText('Android', { exact: true })).toHaveCount(0)
    await page.getByRole('button', { name: platform.ask, exact: true }).click()
    await expect(page.locator('main table').first()).toContainText('Android')
    await expect(page.getByText(cause.why)).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Submit diagnosis' })).toBeDisabled()
  })

  test('a full independent run scores high, shows the model reasoning, and saves once', async ({ page }) => {
    await page.goto(`/practice/rca/${c.slug}`)
    await askAll(page, 'key')
    for (const h of c.hypotheses) {
      await page.getByRole('group', { name: `Rate: ${h.text}` }).getByRole('button', { name: h.cause ? 'Likely' : 'Unlikely', exact: true }).click()
    }
    await page.getByRole('radio', { name: cause.text }).check()
    await page.getByRole('button', { name: 'Submit diagnosis' }).click()
    await expect(page.getByText('independent', { exact: true })).toBeVisible()
    await expect(page.getByText(c.modelReasoning)).toBeVisible()
    for (const r of c.recommendation.rubric) await page.getByLabel(r).check()
    await page.getByRole('button', { name: 'Save to my progress' }).click()
    const ev = await events(page)
    expect(ev).toHaveLength(1)
    expect(ev[0]).toMatchObject({ kind: 'rca', ref: c.slug, assisted: false })
    expect(ev[0].score).toBeGreaterThan(0.9)
    await expect(page.getByRole('button', { name: 'Saved to your progress' })).toBeDisabled()
  })

  test('a wrong cause and noise questions score low and the right cause is explained', async ({ page }) => {
    await page.goto(`/practice/rca/${c.slug}`)
    await askAll(page, 'noise')
    await page.getByRole('radio', { name: c.hypotheses.find((h: any) => h.id === 'competitor').text }).check()
    await page.getByRole('button', { name: 'Submit diagnosis' }).click()
    await expect(page.getByText('You chose a different cause.')).toBeVisible()
    await expect(page.getByText(cause.why, { exact: true }).first()).toBeVisible()
    await page.getByRole('button', { name: 'Save to my progress' }).click()
    expect((await events(page))[0].score).toBeLessThan(0.35)
  })

  test('hints make the attempt assisted; showing the solution scores no diagnosis', async ({ page }) => {
    await page.goto(`/practice/rca/${c.slug}`)
    await page.getByRole('button', { name: /^Hint/ }).click()
    await expect(page.getByText(/Look in the/)).toBeVisible()
    await askAll(page, 'key')
    await page.getByRole('radio', { name: cause.text }).check()
    await page.getByRole('button', { name: 'Submit diagnosis' }).click()
    await expect(page.getByText('assisted', { exact: true }).first()).toBeVisible()
    await page.getByRole('button', { name: 'Save to my progress' }).click()
    expect((await events(page))[0].assisted).toBe(true)

    await page.goto(`/practice/rca/${c.slug}`)
    await page.getByRole('button', { name: 'Show the solution' }).click()
    await expect(page.getByText('You asked for the solution.')).toBeVisible()
  })

  test('revising a rating after evidence arrives is recorded', async ({ page }) => {
    await page.goto(`/practice/rca/${c.slug}`)
    const h = c.hypotheses[0]
    await page.getByRole('group', { name: `Rate: ${h.text}` }).getByRole('button', { name: 'Likely', exact: true }).click()
    await page.getByRole('button', { name: c.evidence[0].ask, exact: true }).click()
    await page.getByRole('group', { name: `Rate: ${h.text}` }).getByRole('button', { name: 'Unlikely', exact: true }).click()
    await expect(page.getByText('You have revised 1 rating')).toBeVisible()
  })

  test('every case works on a phone without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    for (const k of cases) {
      await page.goto(`/practice/rca/${k.slug}`)
      for (const e of k.evidence.slice(0, 4)) await page.getByRole('button', { name: e.ask, exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    }
  })
})

test.describe('consumer lab', () => {
  const ex = exercises[0]
  test('sorting is checked claim by claim, over-generalising is challenged, and the attempt is logged', async ({ page }) => {
    await page.goto(`/practice/consumer/${ex.slug}`)
    await expect(page.getByRole('button', { name: 'Check my work' })).toBeDisabled()
    const label: Record<string, string> = { fact: 'Fact', statement: 'Statement', assumption: 'Assumption', hypothesis: 'Hypothesis' }
    for (const cl of ex.claims) {
      // call the overgeneralising ones facts, to see the warning
      const kind = cl.overgeneralises ? 'fact' : cl.kind
      await page.getByRole('group', { name: `Sort: ${cl.text}` }).getByRole('button', { name: label[kind] }).click()
    }
    await page.getByLabel(ex.evidenceNeeded.find((e: any) => e.useful).text).check()
    await page.getByRole('radio', { name: ex.hypothesisOptions.find((h: any) => h.good).text }).check()
    await page.getByRole('button', { name: 'Check my work' }).click()
    await expect(page.getByText(/and you called it a fact/).first()).toBeVisible()
    const ev = await events(page)
    expect(ev[0]).toMatchObject({ kind: 'consumer', ref: ex.slug, assisted: false })
    expect(ev[0].score).toBeLessThan(1)
  })

  test('all correct scores 100%', async ({ page }) => {
    await page.goto(`/practice/consumer/${ex.slug}`)
    const label: Record<string, string> = { fact: 'Fact', statement: 'Statement', assumption: 'Assumption', hypothesis: 'Hypothesis' }
    for (const cl of ex.claims) await page.getByRole('group', { name: `Sort: ${cl.text}` }).getByRole('button', { name: label[cl.kind] }).click()
    for (const e of ex.evidenceNeeded.filter((x: any) => x.useful)) await page.getByLabel(e.text).check()
    await page.getByRole('radio', { name: ex.hypothesisOptions.find((h: any) => h.good).text }).check()
    await page.getByRole('button', { name: 'Check my work' }).click()
    await expect(page.getByRole('heading', { name: /Result · 100%/ })).toBeVisible()
  })
})

test.describe('path and progress', () => {
  test('setting up a path builds it and the dashboard shows the next step', async ({ page }) => {
    await page.goto('/progress')
    await expect(page.getByRole('link', { name: 'Set up your path' }).first()).toBeVisible()
    await page.goto('/start')
    await expect(page.getByRole('button', { name: 'Build my path' })).toBeDisabled()
    await page.getByRole('radio', { name: /become a product manager/ }).check()
    await page.getByRole('button', { name: 'Build my path' }).click()
    await expect(page).toHaveURL(/\/progress$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Aspiring product manager')
    await expect(page.getByRole('heading', { name: 'Next' })).toBeVisible()
    await expect(page.getByText('Read what a product manager does').first()).toBeVisible()
    const p = await page.evaluate(() => JSON.parse(localStorage.getItem('pp.profile.v1')!))
    expect(p.persona).toBe('aspiring')
  })

  test('finishing a lesson moves the path on, and a step can be skipped', async ({ page }) => {
    await page.addInitScript(`if (!localStorage.getItem('pp.profile.v1')) localStorage.setItem('pp.profile.v1', JSON.stringify({ persona: 'aspiring', hours: 5, tech: 'some', skip: [] }))`)
    await page.goto('/progress')
    await page.getByRole('button', { name: 'Mark done' }).first().click()
    await expect(page.locator('main').getByText('Jobs to be done').first()).toBeVisible()
    await page.getByRole('button', { name: 'I know this' }).first().click()
    await expect(page.getByRole('button', { name: 'Add back' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('button', { name: 'Add back' })).toBeVisible()
  })

  test('a strong technical background trims the basics from the technical path', async ({ page }) => {
    await page.addInitScript(`localStorage.setItem('pp.profile.v1', JSON.stringify({ persona: 'technical', hours: 5, tech: 'strong', skip: [] }))`)
    await page.goto('/progress')
    await page.getByRole('button', { name: /^Show all/ }).click()
    await expect(page.getByText('APIs for product managers')).toHaveCount(0)
    await expect(page.getByText('Latency, caching and scale').first()).toBeVisible()
  })

  test('weak competencies are listed with lessons to try, and the data can be reset', async ({ page }) => {
    await page.addInitScript(
      `localStorage.setItem('pp.progress.v1', JSON.stringify([{ t: 1, kind: 'rca', ref: 'x', comps: ['analytics'], level: 3, score: 0.3, assisted: false, self: false }]))`
    )
    await page.goto('/progress')
    await expect(page.getByRole('heading', { name: 'Weak spots' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Weak spots' }).locator('..')).toContainText('Product analytics')
    await page.getByRole('button', { name: 'Reset my progress' }).click()
    await page.getByRole('button', { name: 'Yes, delete' }).click()
    await expect(page.getByRole('heading', { name: 'Weak spots' })).toHaveCount(0)
    expect(await events(page)).toHaveLength(0)
  })

  test('all twelve competencies are listed', async ({ page }) => {
    await page.goto('/progress')
    for (const c of comps.competencies) await expect(page.getByText(c.name, { exact: true })).toBeVisible()
  })
})

test.describe('interview simulator', () => {
  test('a timed session with follow-ups, a rubric, a readiness estimate and history', async ({ page }) => {
    await page.goto('/interview')
    await page.getByRole('button', { name: 'Product Design', exact: true }).click() // turn off
    await page.getByRole('button', { name: 'Start' }).click()
    for (let i = 0; i < 3; i++) {
      await expect(page.getByText(`Question ${i + 1} of 3`)).toBeVisible()
      await page.getByRole('button', { name: 'Done answering' }).click()
      await expect(page.getByText('Follow-up 1 of 2')).toBeVisible()
      await page.getByRole('button', { name: 'Next follow-up' }).click()
      await page.getByRole('button', { name: 'Review my answer' }).click()
      await expect(page.getByRole('button', { name: /Next question|Finish/ })).toBeDisabled()
      for (const key of ['structure', 'reasoning', 'tradeoffs', 'communication']) await page.locator(`input[name="${key}"]`).nth(2).check()
      await page.getByRole('button', { name: /Next question|Finish and see summary/ }).click()
    }
    await expect(page.getByRole('heading', { name: 'Session summary' })).toBeVisible()
    await expect(page.getByText('Developing').or(page.getByText('Getting ready'))).toBeVisible()
    await expect(page.getByText(/not a prediction of a hiring decision/)).toBeVisible()
    const ev = await events(page)
    expect(ev.filter((e: any) => e.kind === 'interview')).toHaveLength(3)
    expect(ev[0]).toMatchObject({ level: 4, self: true, score: 0.75 })
    await page.getByRole('button', { name: 'Another session' }).click()
    await expect(page.getByRole('heading', { name: 'Previous sessions' })).toBeVisible()
  })

  test('the clock runs and moves on at zero', async ({ page }) => {
    await page.clock.install()
    await page.goto('/interview')
    await page.getByRole('button', { name: '1 min' }).click()
    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByLabel('1:00 left')).toBeVisible()
    for (let i = 0; i < 62; i++) await page.clock.runFor(1000)
    await expect(page.getByText('Follow-up 1 of 2')).toBeVisible()
  })

  test('picking nothing is blocked', async ({ page }) => {
    await page.goto('/interview')
    for (const c of ['Product Design', 'Analytics']) await page.getByRole('button', { name: c, exact: true }).click()
    await expect(page.getByRole('button', { name: 'Start' })).toBeDisabled()
  })
})
