import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  questions,
  categories,
  categoryCounts,
  categorySlug,
  getQuestion,
  curveballs,
} from '../data/questions'
import { useHead } from '../lib/useHead'
import { Page } from '../components/Page'

const chapters = [
  ['/role', '1', 'The role', 'What a PM does. Startup vs MNC. What it is not.'],
  ['/skills', '2', 'Skills', 'Technical and non-technical, with a self-assessment.'],
  ['/browse', '3', 'Question bank', `${questions.length} questions with a model answer and the mistake that sinks most candidates.`],
  ['/companies', '4', 'Companies', 'Interview loops for the MNCs and the Indian APM programs, round by round.'],
]

function Preview() {
  const q = getQuestion('monetize-x-blue-tick')
  const [open, setOpen] = useState(false)
  return (
    <div className="card mt-2 p-3">
      <p className="label">
        {q.category} · curveball · a real question
      </p>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="mt-0.5 flex w-full items-start gap-2 text-left"
      >
        <span className="mt-1 font-mono text-ink-faint" aria-hidden="true">
          {open ? '–' : '+'}
        </span>
        <span className="text-md text-ink">{q.question}</span>
      </button>
      {open && (
        <div className="mt-3 pl-4">
          <p className="label !text-ink">Failure mode</p>
          <p className="prose-body border-l-4 border-accent pl-3">
            {q.failureMode}
          </p>
          <p className="mt-3 text-sm">
            <Link to={`/browse/${q.id}`}>Read the full answer</Link>
          </p>
        </div>
      )}
    </div>
  )
}

export default function Landing() {
  useHead({
    title: null,
    description:
      'Free, no-login prep for your first PM interview. The role, the skills, a question bank, and company loops — built for students applying to APM programs.',
    path: '/',
  })
  const counts = categoryCounts()

  return (
    <Page>
      <h1 className="text-3xl sm:text-[3.5rem]">Prep for your first PM interview.</h1>
      <p className="prose-body mt-3 max-w-[34rem]">
        For final-year students applying to PM intern and APM roles — including
        the Indian programs nobody else builds prep for. No login, no paywall.
      </p>
      <p className="mt-5 flex flex-wrap gap-3">
        <Link
          to="/browse"
          className="btn btn-primary no-underline"
        >
          Browse the questions
        </Link>
        <Link
          to="/flashcards"
          className="btn no-underline"
        >
          Start flashcards
        </Link>
      </p>

      <nav className="mt-6 grid gap-3">
        {chapters.map(([to, n, label, desc]) => (
          <Link
            key={to}
            to={to}
            className="card flex gap-3 px-3 py-2.5 no-underline hover:bg-paper"
          >
            <span className="label pt-0.5 !text-ink">{n}</span>
            <span>
              <span className="text-md text-ink">{label}</span>
              <span className="prose-body block">{desc}</span>
            </span>
          </Link>
        ))}
      </nav>

      <p className="label mt-6">What a question looks like</p>
      <Preview />

      <p className="sticky-note mt-7 text-sm leading-snug sm:max-w-md">
        <strong>The one rule.</strong> Only talk about
        products you use regularly. Depth beats an impressive-sounding choice —
        walk in with three real frustrations and three specific fixes for
        something you open every day.
      </p>

      <p className="label mt-7">Categories</p>
      <ul className="mt-1 border-t-2 border-rule-hard">
        {categories.map((c) => (
          <li key={c} className="border-b border-rule">
            <Link
              to={`/browse?category=${categorySlug(c)}`}
              className="flex items-baseline justify-between py-1.5 text-sm text-ink no-underline hover:text-accent"
            >
              <span>{c}</span>
              <span className="label">{counts[c]}</span>
            </Link>
          </li>
        ))}
        <li className="border-b border-rule">
          <Link
            to="/browse?hard=1"
            className="flex items-baseline justify-between py-1.5 text-sm font-semibold text-ink no-underline"
          >
            <span>Curveballs</span>
            <span className="label">{curveballs().length}</span>
          </Link>
        </li>
      </ul>

      <p className="prose-body mt-6">
        That is the whole site. <Link to="/role">Start with the role</Link> if
        you are new to product, or go straight to the{' '}
        <Link to="/browse">questions</Link>.
      </p>
    </Page>
  )
}
