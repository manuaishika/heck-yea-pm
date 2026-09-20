import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import {
  questions,
  categories,
  categoryCounts,
  categorySlug,
  categoryFromSlug,
  curveballs,
} from '../data/questions'
import { matchesQuery, queryTokens } from '../lib/search'
import { useDebounced } from '../lib/useDebounced'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import QuestionList from '../components/QuestionList'

const chip = 'pill'
const chipOn = 'pill-on'
const chipOff = ''

const curveballCount = curveballs().length

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const rawCategory = searchParams.get('category') || ''
  const activeCategory = categoryFromSlug(rawCategory)
  const hardOnly = searchParams.get('hard') === '1'
  const urlQuery = searchParams.get('q') || ''

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

  const results = useMemo(() => {
    const tokens = queryTokens(debouncedInput)
    return questions.filter(
      (q) =>
        (!activeCategory || q.category === activeCategory) &&
        (!hardOnly || q.hard) &&
        matchesQuery(q, tokens)
    )
  }, [activeCategory, hardOnly, debouncedInput])

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
    Boolean(activeCategory) || hardOnly || debouncedInput.trim().length > 0
  const linkTo = (q) => `/browse/${q.id}${location.search}`

  return (
    <Page>
      <PageHead
        chapter="Chapter 3"
        title="Question bank"
        intro={`${questions.length} questions across six categories. Expand one to read it here; open its page to share the link.`}
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
          className="mt-1 w-full rounded-[6px] border-2 border-ink bg-paper-2 px-3 py-1.5 text-sm placeholder:text-ink-faint focus-visible:border-accent"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => patchParams((p) => p.delete('category'))}
          aria-pressed={!activeCategory}
          className={`${chip} ${!activeCategory && !hardOnly ? chipOn : chipOff}`}
        >
          all {questions.length}
        </button>
        {categories.map((cat) => {
          const slug = categorySlug(cat)
          const on = activeCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() =>
                patchParams((p) => {
                  if (on) p.delete('category')
                  else p.set('category', slug)
                })
              }
              aria-pressed={on}
              className={`${chip} ${on ? chipOn : chipOff}`}
            >
              {cat.toLowerCase()} {counts[cat]}
            </button>
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
      </div>

      <p aria-live="polite" className="label mt-5">
        {results.length === questions.length
          ? `${results.length} questions`
          : `${results.length} of ${questions.length}`}
        {activeCategory ? ` · ${activeCategory.toLowerCase()}` : ''}
        {hardOnly ? ' · curveballs' : ''}
        {debouncedInput.trim() ? ` · "${debouncedInput.trim()}"` : ''}
      </p>

      {results.length > 0 ? (
        <div className="mt-2">
          <QuestionList questions={results} linkTo={linkTo} />
        </div>
      ) : (
        <div className="mt-4 border-t border-rule pt-6">
          <p className="text-ink">Nothing matches that.</p>
          <p className="prose-body mt-1.5">
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
    </Page>
  )
}
