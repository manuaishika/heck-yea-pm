import { useState } from 'react'
import { useParams, useLocation, Link, Navigate } from 'react-router-dom'
import {
  resolveQuestionId,
  getQuestion,
  relatedQuestions,
  categoryNeighbors,
  shortAnswer,
} from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { Detail, Block, Bullets, CategoryTag } from '../components/ui'
import MethodLinks from '../components/MethodLinks'
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
      className="btn btn-sm"
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
  const [fullOpen, setFullOpen] = useState(false)

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
      <PageHead
        chapter={
          <Link to={`/browse${location.search}`} className="no-underline hover:no-underline">
            Question bank
          </Link>
        }
        title={q.question}
        intro={
          <span className="flex flex-wrap items-center gap-2">
            <CategoryTag category={q.category} />
            {q.hard && <span className="label">curveball</span>}
          </span>
        }
        aside={
          <div className="flex shrink-0 items-center gap-2">
            <CopyLink id={q.id} />
            <SaveButton id={q.id} question={q.question} withLabel />
          </div>
        }
      />

      <div className="card">
        <Block label="Answer" rule={false}>
          <Bullets items={shortAnswer(q)} />
          <button
            type="button"
            className="label mt-3 flex min-h-11 items-center text-accent"
            aria-expanded={fullOpen}
            onClick={() => setFullOpen((v) => !v)}
          >
            {fullOpen ? 'Show less' : 'Full answer'}
          </button>
        </Block>
        {fullOpen && (
          <>
            <Detail
              columns={q.sections.map((sec) => ({
                label: sec.label,
                children: <Bullets items={sec.points} />,
              }))}
            />
            {q.tip && (
              <Block label="What they test">
                <p>{q.tip}</p>
              </Block>
            )}
            <Block label="Failure mode">
              <p>{q.failureMode}</p>
            </Block>
          </>
        )}
        <MethodLinks question={q} />
      </div>

      {q.companies.length > 0 && (
        <section className="mt-6">
          <p className="label">Asked at</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {q.companies.map((c) => (
              <li key={c}>
                <CompanyMark name={c} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <nav aria-label={`More ${q.category} questions`} className="mt-8">
          <p className="label">More in {q.category.toLowerCase()}</p>
          <ul className="mt-2 divide-y divide-border border-y border-border">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/browse/${r.id}`}
                  className="block py-2 text-text no-underline hover:text-accent hover:no-underline"
                >
                  {r.question}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {(prev || next) && (
        <nav aria-label="Question navigation" className="mt-6 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link to={`/browse/${prev.id}`} className="group no-underline hover:no-underline">
              <span className="label">Previous</span>
              <span className="mt-1 block text-text group-hover:text-accent">{prev.question}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={`/browse/${next.id}`}
              className="group no-underline hover:no-underline sm:text-right"
            >
              <span className="label">Next</span>
              <span className="mt-1 block text-text group-hover:text-accent">{next.question}</span>
            </Link>
          )}
        </nav>
      )}
    </Page>
  )
}
