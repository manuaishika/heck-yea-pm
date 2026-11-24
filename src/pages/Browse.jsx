import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import {
  questions,
  categories,
  categoryCounts,
  categorySlug,
  categoryFromSlug,
  curveballs,
  topics,
  topicCounts,
  topicFromSlug,
} from '../data/questions'
import { matchesQuery, queryTokens } from '../lib/search'
import { useDebounced } from '../lib/useDebounced'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { CategoryTag } from '../components/ui'
import Pip from '../components/Pip'
import QuestionList from '../components/QuestionList'

const SORTS = [
  { id: 'default', label: 'Bank order' },
  { id: 'most-asked', label: 'Most asked' },
  { id: 'curveballs', label: 'Curveballs first' },
  { id: 'az', label: 'A to Z' },
]

// company tags that appear on at least one question, with counts, biggest first
const companyCounts = (() => {
  const m = new Map()
  for (const q of questions) for (const c of q.companies) m.set(c, (m.get(c) || 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})()
const taggedCount = questions.filter((q) => q.companies.length > 0).length

function sortQuestions(list, sort) {
  const idx = new Map(questions.map((q, i) => [q.id, i]))
  const byBank = (a, b) => idx.get(a.id) - idx.get(b.id)
  const out = [...list]
  if (sort === 'most-asked') out.sort((a, b) => b.companies.length - a.companies.length || byBank(a, b))
  else if (sort === 'curveballs') out.sort((a, b) => Number(b.hard) - Number(a.hard) || byBank(a, b))
  else if (sort === 'az') out.sort((a, b) => a.question.localeCompare(b.question))
  return out
}

const chip = 'pill'
const chipOn = 'pill-on'
const chipOff = ''

const curveballCount = curveballs().length
const topicTotals = topicCounts()

// first view: a few per category, not the whole bank
const PER_GROUP = 3
// filtered view: this many, then "show more"
const PAGE = 10

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const rawCategory = searchParams.get('category') || ''
  const activeCategory = categoryFromSlug(rawCategory)
  const hardOnly = searchParams.get('hard') === '1'
  const activeTopic = topicFromSlug(searchParams.get('topic') || '')
  const urlQuery = searchParams.get('q') || ''
  const rawCompany = searchParams.get('company') || ''
  const activeCompany =
    rawCompany === 'any' ? 'any' : companyCounts.find(([c]) => c.toLowerCase() === rawCompany.toLowerCase())?.[0] || ''
  const rawSort = searchParams.get('sort') || 'default'
  const activeSort = SORTS.some((s) => s.id === rawSort) ? rawSort : 'default'

  const [input, setInput] = useState(urlQuery)
  const debouncedInput = useDebounced(input, 200)

  useHead({
    title: activeCategory ? `${activeCategory} questions` : 'Question bank',
    description:
      'Every question, filterable by category and keyword. What each interviewer is testing, a model answer, and the mistake that sinks most candidates.',
    path: '/browse',
  })

  useEffect(() => {
    if (debouncedInput === urlQuery) return
    const next = new URLSearchParams(searchParams)
    if (debouncedInput.trim()) next.set('q', debouncedInput)
    else next.delete('q')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput])

  useEffect(() => {
    if (urlQuery !== debouncedInput) setInput(urlQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery])

  useEffect(() => {
    if (rawCategory && !activeCategory) {
      const next = new URLSearchParams(searchParams)
      next.delete('category')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawCategory, activeCategory])

  const counts = useMemo(() => categoryCounts(), [])

  const filterKey = `${activeCategory}|${hardOnly}|${activeTopic}|${activeCompany}|${activeSort}|${debouncedInput}`
  const [shown, setShown] = useState(PAGE)
  const [shownFor, setShownFor] = useState(filterKey)
  if (shownFor !== filterKey) {
    setShownFor(filterKey)
    setShown(PAGE)
  }

  const results = useMemo(() => {
    const tokens = queryTokens(debouncedInput)
    const list = questions.filter(
      (q) =>
        (!activeCategory || q.category === activeCategory) &&
        (!hardOnly || q.hard) &&
        (!activeTopic || q.topic === activeTopic) &&
        (!activeCompany ||
          (activeCompany === 'any' ? q.companies.length > 0 : q.companies.includes(activeCompany))) &&
        matchesQuery(q, tokens)
    )
    return sortQuestions(list, activeSort)
  }, [activeCategory, hardOnly, activeTopic, activeCompany, activeSort, debouncedInput])

  function patchParams(mutate) {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    setSearchParams(next)
  }

  function resetAll() {
    setInput('')
    setSearchParams({})
  }

  const hasFilter =
    Boolean(activeCategory) ||
    hardOnly ||
    Boolean(activeTopic) ||
    Boolean(activeCompany) ||
    activeSort !== 'default' ||
    debouncedInput.trim().length > 0
  const linkTo = (q) => `/browse/${q.id}${location.search}`

  return (
    <Page>
      <PageHead
        chapter="Module"
        title="Question bank"
        intro={`${questions.length} questions across ${categories.length} categories.`}
      />

      <div className="mt-4">
        <label htmlFor="q" className="label">
          Search question and answer text
        </label>
        <input
          id="q"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="metrics, pricing, tell me about a time…"
          autoComplete="off"
          className="mt-1 w-full rounded-button border border-border bg-surface px-3 py-2 text-body placeholder:text-text-muted focus-visible:border-accent"
        />
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [&>*]:shrink-0">
        <button
          type="button"
          onClick={() =>
            patchParams((p) => {
              p.delete('category')
              p.delete('topic')
            })
          }
          aria-pressed={!activeCategory}
          className={`${chip} ${!activeCategory && !hardOnly && !activeTopic ? chipOn : chipOff}`}
        >
          all {questions.length}
        </button>
        {categories.map((cat) => {
          const slug = categorySlug(cat)
          const on = activeCategory === cat
          return (
            <CategoryTag
              key={cat}
              category={cat}
              count={counts[cat]}
              pressed={on}
              onClick={() =>
                patchParams((p) => {
                  if (on) p.delete('category')
                  else p.set('category', slug)
                })
              }
            />
          )
        })}
        <button
          type="button"
          onClick={() =>
            patchParams((p) => {
              if (hardOnly) p.delete('hard')
              else p.set('hard', '1')
            })
          }
          aria-pressed={hardOnly}
          className={`${chip} ${hardOnly ? chipOn : chipOff}`}
        >
          curveballs {curveballCount}
        </button>
        {topics.map((t) => {
          const on = activeTopic === t.slug
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() =>
                patchParams((p) => {
                  if (on) p.delete('topic')
                  else p.set('topic', t.slug)
                })
              }
              aria-pressed={on}
              className={`${chip} ${on ? chipOn : chipOff}`}
            >
              {t.label} {topicTotals[t.slug]}
            </button>
          )
        })}
      </div>

      <p className="label mt-4">Asked at</p>
      <div
        className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [&>*]:shrink-0"
        role="group"
        aria-label="Filter by company"
      >
        {[['any', 'any company', taggedCount], ...companyCounts.map(([c, n]) => [c, c, n])].map(([value, label, n]) => {
          const on = activeCompany === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              onClick={() =>
                patchParams((p) => {
                  if (on) p.delete('company')
                  else p.set('company', value)
                })
              }
              className={`${chip} ${on ? chipOn : chipOff}`}
            >
              {label} {n}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        <label htmlFor="sort" className="label">
          Sort by
        </label>
        <select
          id="sort"
          value={activeSort}
          onChange={(e) =>
            patchParams((p) => {
              if (e.target.value === 'default') p.delete('sort')
              else p.set('sort', e.target.value)
            })
          }
          className="mt-1 block min-h-11 w-full rounded-button border border-border bg-surface px-3 text-body text-text focus-visible:border-accent sm:w-auto"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        {activeSort === 'most-asked' && (
          <p className="mt-2 text-text-muted">Ranked by how many companies a question is tagged to. Only {taggedCount} of {questions.length} carry a company tag.</p>
        )}
      </div>

      <p aria-live="polite" className="label mt-5">
        {results.length === questions.length
          ? `${results.length} questions`
          : `${results.length} of ${questions.length}`}
        {activeCategory ? ` · ${activeCategory.toLowerCase()}` : ''}
        {hardOnly ? ' · curveballs' : ''}
        {activeCompany ? ` · ${activeCompany === 'any' ? 'asked at a company' : `asked at ${activeCompany}`}` : ''}
        {activeSort !== 'default' ? ` · ${SORTS.find((s) => s.id === activeSort).label.toLowerCase()}` : ''}
        {activeTopic ? ` · ${topics.find((t) => t.slug === activeTopic).label}` : ''}
        {debouncedInput.trim() ? ` · "${debouncedInput.trim()}"` : ''}
      </p>

      {results.length > 0 && !hasFilter ? (
        <div className="mt-2 space-y-8">
          {categories.map((cat) => {
            const list = results.filter((q) => q.category === cat)
            return (
              <section key={cat}>
                <div className="flex items-baseline justify-between gap-3 border-b border-ink pb-1">
                  <h2 className="text-section">{cat}</h2>
                  <span className="label">{list.length}</span>
                </div>
                <div className="mt-2">
                  <QuestionList questions={list.slice(0, PER_GROUP)} linkTo={linkTo} showCategory={false} />
                </div>
                {list.length > PER_GROUP && (
                  <button
                    type="button"
                    onClick={() => patchParams((p) => p.set('category', categorySlug(cat)))}
                    className="btn btn-sm mt-2"
                  >
                    All {list.length} {cat.toLowerCase()} →
                  </button>
                )}
              </section>
            )
          })}
        </div>
      ) : results.length > 0 ? (
        <div className="mt-2">
          <QuestionList questions={results.slice(0, shown)} linkTo={linkTo} showCategory={!activeCategory} />
          {results.length > shown && (
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className="btn mt-3 w-full">
              Show {Math.min(PAGE, results.length - shown)} more · {results.length - shown} left
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center border-t border-border pt-6 text-center">
          <Pip mood="oops" size={56} className="mb-3" />
          <p className="text-text">Nothing matches that.</p>
          <p className="prose-body mt-2">
            Try a shorter or more general term
            {activeCategory ? ', or clear the category' : ''}. Search covers the
            question and the full answer.
          </p>
          {hasFilter && (
            <button
              type="button"
              onClick={resetAll}
              className="btn mt-3"
            >
              Clear everything
            </button>
          )}
        </div>
      )}

      <p className="mt-8 flex flex-wrap gap-3 border-t border-border pt-4 text-text-muted">
        <Link to="/methods">Answering frameworks</Link>
        <span aria-hidden="true">·</span>
        <Link to="/guesstimates">Guesstimate practice</Link>
      </p>
    </Page>
  )
}
