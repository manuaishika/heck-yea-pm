import { useState } from 'react'
import { useParams, useLocation, Link, Navigate } from 'react-router-dom'
import {
  resolveQuestionId,
  getQuestion,
  relatedQuestions,
  categoryNeighbors,
} from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page } from '../components/Page'
import AnswerSlides from '../components/AnswerSlides'
import SaveButton from '../components/SaveButton'
import CompanyMark from '../components/CompanyMark'
import NotFound from './NotFound'

function CopyLink({ id }) {
  const [copied, setCopied] = useState(false)
  const url =
    (typeof window !== 'undefined' ? window.location.origin : '') + `/browse/${id}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* nothing more to try */
      }
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="chip"
    >
      {copied ? 'copied' : 'copy link'}
    </button>
  )
}

export default function QuestionDetail() {
  const { id } = useParams()
  const location = useLocation()
  const canonicalId = resolveQuestionId(id)

  if (!canonicalId) return <NotFound />
  if (canonicalId !== id) {
    return <Navigate to={`/browse/${canonicalId}${location.search}`} replace />
  }

  const q = getQuestion(canonicalId)
  const related = relatedQuestions(q, 3)
  const { prev, next } = categoryNeighbors(q)

  const answerSection =
    q.sections.find((s) => /answer/i.test(s.label)) ||
    q.sections[q.sections.length - 1]
  useHead({
    title: q.question.replace(/\s+/g, ' ').slice(0, 70),
    description: (answerSection?.points.join('. ') || q.question)
      .replace(/\s+/g, ' ')
      .slice(0, 155),
    path: `/browse/${q.id}`,
  })

  return (
    <Page>
      <p className="label">
        <Link to={`/browse${location.search}`}>Question bank</Link>
      </p>

      <header className="mt-3 border-b-2 border-rule-hard pb-3">
        <p className="label flex items-center gap-2">
          <span>{q.category}</span>
          {q.hard && <span className="text-accent">· curveball</span>}
        </p>
        <h1 className="mt-1 text-xl sm:text-2xl">{q.question}</h1>
        <div className="mt-3 flex items-center gap-1.5">
          <CopyLink id={q.id} />
          <SaveButton id={q.id} question={q.question} withLabel />
        </div>
      </header>

      <div className="mt-4">
        <p className="label">Swipe through the answer</p>
        <AnswerSlides question={q} />

        {q.companies.length > 0 && (
          <section className="mt-5">
            <p className="label">Asked at</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {q.companies.map((c) => (
                <li key={c}>
                  <CompanyMark name={c} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <nav
          aria-label={`More ${q.category} questions`}
          className="mt-8 border-t border-rule pt-4"
        >
          <p className="label">More in {q.category.toLowerCase()}</p>
          <ul className="mt-1.5">
            {related.map((r) => (
              <li key={r.id} className="border-b border-rule last:border-0">
                <Link
                  to={`/browse/${r.id}`}
                  className="block py-2 text-sm text-ink no-underline hover:text-accent"
                >
                  {r.question}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {(prev || next) && (
        <nav
          aria-label="Question navigation"
          className="mt-6 grid gap-3 border-t border-rule pt-4 sm:grid-cols-2"
        >
          {prev ? (
            <Link to={`/browse/${prev.id}`} className="group no-underline">
              <span className="label">Previous</span>
              <span className="mt-0.5 block text-sm text-ink group-hover:text-accent">
                {prev.question}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={`/browse/${next.id}`}
              className="group no-underline sm:text-right"
            >
              <span className="label">Next</span>
              <span className="mt-0.5 block text-sm text-ink group-hover:text-accent">
                {next.question}
              </span>
            </Link>
          )}
        </nav>
      )}
    </Page>
  )
}
