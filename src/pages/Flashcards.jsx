import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  categories,
  categoryCounts,
  questionsInCategory,
  getQuestion,
} from '../data/questions'
import { useFlashcardSession } from '../lib/useFlashcardSession'
import { useReviews } from '../lib/useReviews'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** The short answer for the back of a card: at most 5 bullets. */
function cardPoints(q) {
  const star = q.sections.filter((s) =>
    /^(situation|task|action|result)/i.test(s.label)
  )
  if (star.length >= 3) {
    // one line per STAR beat
    return star.map((s) => `${s.label.split(' ')[0]}: ${s.points[0]}`)
  }
  const answer =
    q.sections.find((s) => /answer/i.test(s.label)) ||
    q.sections[q.sections.length - 1]
  return answer.points.slice(0, 5)
}

/* ---------------------------------------------------------------- picker */

function Picker({ onStart, reviewIds }) {
  const [selected, setSelected] = useState(() => new Set())
  const counts = useMemo(() => categoryCounts(), [])

  function toggle(cat) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const deckSize = categories
    .filter((c) => selected.has(c))
    .reduce((n, c) => n + counts[c], 0)

  return (
    <>
      <p className="label mt-6">Pick categories</p>
      <ul className="mt-2 border-t border-border">
        {categories.map((cat) => (
          <li key={cat} className="border-b border-border">
            <label className="flex cursor-pointer items-center gap-3 py-3 text-body">
              <input
                type="checkbox"
                checked={selected.has(cat)}
                onChange={() => toggle(cat)}
                className="accent-accent"
              />
              <span className="flex-1 text-text">{cat}</span>
              <span className="label">{counts[cat]}</span>
            </label>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={deckSize === 0}
        onClick={() =>
          onStart(
            shuffle(
              categories
                .filter((c) => selected.has(c))
                .flatMap((c) => questionsInCategory(c).map((q) => q.id))
            )
          )
        }
        className="btn btn-primary mt-4"
      >
        {deckSize === 0
          ? 'Select a category to start'
          : `Start · ${deckSize} card${deckSize === 1 ? '' : 's'}`}
      </button>

      {reviewIds.length > 0 && (
        <p className="mt-4 text-body">
          <button
            type="button"
            onClick={() => onStart(shuffle(reviewIds))}
            className="font-semibold text-accent underline underline-offset-2"
          >
            Review your {reviewIds.length} flagged{' '}
            {reviewIds.length === 1 ? 'card' : 'cards'}
          </button>
        </p>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ deck */

function Deck({ session, prev, next, finish }) {
  const navigate = useNavigate()
  const { marks, mark } = useReviews()
  const [showBack, setShowBack] = useState(false)
  const touch = useRef(null)

  const total = session.ids.length
  const id = session.ids[session.i]
  const q = getQuestion(id)
  const currentMark = marks[id]
  const atStart = session.i === 0
  const atEnd = session.i >= total - 1

  useEffect(() => {
    setShowBack(false)
  }, [session.i])

  function done() {
    finish()
    navigate('/flashcards/complete')
  }
  function advance() {
    if (atEnd) done()
    else next()
  }
  function markCard(status) {
    mark(id, status)
    advance()
  }

  useEffect(() => {
    function onKey(e) {
      if (e.target.matches('input, textarea')) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setShowBack((v) => !v)
      } else if (e.key === 'ArrowRight') advance()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key.toLowerCase() === 'k') markCard('known')
      else if (e.key.toLowerCase() === 'r') markCard('review')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="label" aria-live="polite">
          {session.i + 1} / {total}
          {currentMark
            ? ` · ${currentMark === 'known' ? 'known' : 'needs review'}`
            : ''}
        </p>
        <button
          type="button"
          onClick={done}
          className="btn btn-sm"
        >
          end session
        </button>
      </div>

      <span className="mt-2 block h-1 overflow-hidden bg-border" aria-hidden="true">
        <span
          className="block h-full bg-accent transition-[width] duration-200"
          style={{ width: `${((session.i + 1) / total) * 100}%` }}
        />
      </span>

      {/* card + arrows */}
      <div className="mt-3 flex items-stretch gap-2">
        <button
          type="button"
          onClick={prev}
          disabled={atStart}
          aria-label="Previous card"
          className="shrink-0 px-1 text-page text-text disabled:opacity-25"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={() => setShowBack((v) => !v)}
          aria-pressed={showBack}
          aria-label={showBack ? 'Show question' : 'Show answer'}
          onTouchStart={(e) => {
            touch.current = e.changedTouches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (touch.current == null) return
            const dx = e.changedTouches[0].clientX - touch.current
            if (dx < -45) advance()
            else if (dx > 45) prev()
            else setShowBack((v) => !v)
            touch.current = null
          }}
          className="card min-h-52 flex-1 p-4 text-left"
        >
          <span key={String(showBack)} className="flip block">
          <span className="label block">
            {q.category}
            {q.hard ? ' · curveball' : ''} · {showBack ? 'answer' : 'question'}
          </span>
          {!showBack ? (
            <span className="mt-3 block text-body text-text">{q.question}</span>
          ) : (
            <ul className="mt-3 space-y-2">
              {cardPoints(q).map((p, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-body leading-snug text-text-muted"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 bg-text" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
          </span>
        </button>

        <button
          type="button"
          onClick={advance}
          aria-label="Next card"
          className="shrink-0 px-1 text-page text-text"
        >
          ›
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => markCard('known')}
          className="btn btn-primary flex-1"
        >
          Known
        </button>
        <button
          type="button"
          onClick={() => markCard('review')}
          className="btn flex-1"
        >
          Needs review
        </button>
      </div>

      <p className="mt-3 flex items-center justify-between text-body">
        <Link to={`/browse/${q.id}`} className="font-semibold">
          Full answer →
        </Link>
        <span className="label">tap card to flip · swipe to move</span>
      </p>
    </div>
  )
}

/* --------------------------------------------------------------- wrapper */

export default function Flashcards() {
  const { session, start, prev, next, finish } = useFlashcardSession()
  const { marks } = useReviews()
  useHead({
    title: 'Flashcards',
    description:
      'Study the question bank as flashcards. Mark each card known or needs review; your progress is saved.',
    path: '/flashcards',
  })

  const reviewIds = Object.keys(marks).filter(
    (id) => marks[id] === 'review' && getQuestion(id)
  )

  return (
    <Page>
      <PageHead
        chapter="Library"
        title="Flashcards"
        intro={
          session
            ? 'Flip, judge yourself, move on. Marks save as you go.'
            : 'Pick what to study. Flip for a short answer, then mark each card.'
        }
      />
      {session ? (
        <Deck session={session} prev={prev} next={next} finish={finish} />
      ) : (
        <Picker onStart={start} reviewIds={reviewIds} />
      )}
    </Page>
  )
}
