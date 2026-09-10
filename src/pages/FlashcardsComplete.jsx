import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getQuestion } from '../data/questions'
import { readLastSession, useFlashcardSession } from '../lib/useFlashcardSession'
import { useReviews } from '../lib/useReviews'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

export default function FlashcardsComplete() {
  const navigate = useNavigate()
  const { start } = useFlashcardSession()
  const { marks } = useReviews()
  useHead({ title: 'Session done', description: 'Your flashcard session summary.', path: '/flashcards/complete' })

  const deck = useMemo(() => readLastSession() || [], [])

  // no session to summarise — someone hit the URL directly
  if (deck.length === 0) {
    return (
      <Page>
        <PageHead title="No session yet" />
        <p className="prose-body mt-4">
          Start one from <Link to="/flashcards">Flashcards</Link>.
        </p>
      </Page>
    )
  }

  const known = deck.filter((id) => marks[id] === 'known')
  const review = deck.filter((id) => marks[id] === 'review')
  const skipped = deck.filter((id) => !marks[id])

  return (
    <Page>
      <PageHead
        title="Session done"
        intro={`${deck.length} card${deck.length === 1 ? '' : 's'}.`}
      />

      <dl className="mt-4 border-t border-rule">
        {[
          ['Known', known.length],
          ['Needs review', review.length],
          ['Not marked', skipped.length],
        ].map(([label, n]) => (
          <div
            key={label}
            className="flex items-baseline justify-between border-b border-rule py-2.5"
          >
            <dt className="text-sm text-ink">{label}</dt>
            <dd className="label tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        {review.length > 0 && (
          <button
            type="button"
            onClick={() => {
              start(review)
              navigate('/flashcards')
            }}
            className="border border-rule-hard px-3 py-1.5 text-sm text-ink"
          >
            Review the {review.length} you flagged
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate('/flashcards')}
          className="border border-rule px-3 py-1.5 text-sm text-ink hover:border-rule-hard"
        >
          New session
        </button>
      </div>

      {review.length > 0 && (
        <ul className="mt-6 border-t border-rule">
          {review.map((id) => {
            const q = getQuestion(id)
            return (
              <li key={id} className="border-b border-rule">
                <Link
                  to={`/browse/${id}`}
                  className="block py-2 text-sm text-ink no-underline hover:text-accent"
                >
                  {q.question}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Page>
  )
}
