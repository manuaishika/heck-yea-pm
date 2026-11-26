import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { questions, categories } from '../data/questions'
import { competencyData, interview } from '../data/learn'
import { logEvent, saveSession, useSessions } from '../lib/learning'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { CategoryTag } from '../components/ui'
import Points from '../components/Points'
import SpeakPractice from '../components/SpeakPractice'

const COUNTS = [3, 5, 8]
const MINUTES = [1, 2, 3]
const LEVELS = [
  ['mixed', 'Mixed'],
  ['standard', 'Standard'],
  ['hard', 'Curveballs'],
]
const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const pct = (x) => `${Math.round(x * 100)}%`
const shuffle = (a) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

export function bandFor(score) {
  let band = interview.bands[0]
  for (const b of interview.bands) if (score >= b.min) band = b
  return band
}

export function pickQuestions({ cats, level, count }) {
  const pool = questions.filter((q) => cats.includes(q.category) && (level === 'mixed' || (level === 'hard') === q.hard))
  return shuffle(pool).slice(0, count)
}

export default function Interview() {
  useHead({
    title: 'Interview simulator',
    description:
      'A timed mock product interview: pick categories and difficulty, answer out loud against a clock, take follow-ups, and score yourself on a five-part scorecard.',
    path: '/interview',
  })
  const [cfg, setCfg] = useState({ cats: ['Product Design', 'Analytics'], level: 'mixed', count: 3, minutes: 2 })
  const [session, setSession] = useState(null) // { qs, i, phase, left, fu, ratings: [] }
  const [error, setError] = useState('')

  function start() {
    const qs = pickQuestions(cfg)
    if (qs.length === 0) {
      setError('No questions match. Add a category or change the difficulty.')
      return
    }
    setError('')
    setSession({ qs, i: 0, phase: 'answer', left: cfg.minutes * 60, fu: 0, scores: [], started: Date.now(), cfg })
  }

  if (!session) return <Setup cfg={cfg} setCfg={setCfg} start={start} error={error} />
  return <Run session={session} setSession={setSession} exit={() => setSession(null)} />
}

function Setup({ cfg, setCfg, start, error }) {
  const sessions = useSessions()
  const toggle = (c) => setCfg((s) => ({ ...s, cats: s.cats.includes(c) ? s.cats.filter((x) => x !== c) : [...s.cats, c] }))
  const available = pickQuestions({ ...cfg, count: 999 }).length
  return (
    <Page>
      <PageHead chapter="Interview simulator" title="Mock interview" intro="Timed answers, follow-up questions, and a five-part scorecard. You score yourself, so be honest." />

      <fieldset>
        <legend className="label">Categories</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} type="button" aria-pressed={cfg.cats.includes(c)} onClick={() => toggle(c)} className="pill">
              {c}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4">
        <legend className="label">Difficulty</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LEVELS.map(([k, l]) => (
            <button key={k} type="button" aria-pressed={cfg.level === k} onClick={() => setCfg((s) => ({ ...s, level: k }))} className="pill">
              {l}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4">
        <legend className="label">Questions</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {COUNTS.map((n) => (
            <button key={n} type="button" aria-pressed={cfg.count === n} onClick={() => setCfg((s) => ({ ...s, count: n }))} className="pill">
              {n}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4">
        <legend className="label">Time per answer</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MINUTES.map((n) => (
            <button key={n} type="button" aria-pressed={cfg.minutes === n} onClick={() => setCfg((s) => ({ ...s, minutes: n }))} className="pill">
              {n} min
            </button>
          ))}
        </div>
      </fieldset>

      <p className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" disabled={cfg.cats.length === 0 || available === 0} onClick={start}>
          Start
        </button>
        <span className="text-text-muted">{cfg.cats.length === 0 ? 'Pick a category.' : `${available} questions match.`}</span>
      </p>
      {error && (
        <p role="alert" className="mt-2 text-text">
          {error}
        </p>
      )}

      {sessions.length > 0 && (
        <section className="mt-10" aria-labelledby="hist-h">
          <h2 id="hist-h" className="text-section">
            Previous sessions
          </h2>
          <ul className="mt-2 border-t border-border">
            {[...sessions].reverse().map((s) => (
              <li key={s.at} className="border-b border-border py-2">
                <details>
                  <summary className="cursor-pointer text-text">
                    {new Date(s.at).toLocaleDateString()} · {s.items.length} {s.items.length === 1 ? 'question' : 'questions'} · {pct(s.total)} · {s.band}
                  </summary>
                  <ul className="mt-2 space-y-1 text-text-muted">
                    {s.items.map((it) => (
                      <li key={it.id}>
                        <Link to={`/browse/${it.id}`}>{it.question}</Link> · {pct(it.score)}
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Page>
  )
}

function Run({ session, setSession, exit }) {
  const { qs, i, phase } = session
  const q = qs[i]
  const finished = phase === 'summary'
  const followUps = useMemo(() => (q ? shuffle(interview.followUps[q.category]).slice(0, 2) : []), [q?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // countdown for the answer phase
  useEffect(() => {
    if (phase !== 'answer') return undefined
    if (session.left <= 0) {
      setSession((s) => ({ ...s, phase: 'followup', fu: 0 }))
      return undefined
    }
    const id = setTimeout(() => setSession((s) => ({ ...s, left: s.left - 1 })), 1000)
    return () => clearTimeout(id)
  }, [phase, session.left]) // eslint-disable-line react-hooks/exhaustive-deps

  if (finished) return <Summary session={session} exit={exit} />

  return (
    <Page>
      <PageHead chapter={`Question ${i + 1} of ${qs.length}`} title={q.question} intro={<CategoryTag category={q.category} />} />

      {phase === 'answer' && (
        <section aria-label="Answer">
          <p className="flex flex-wrap items-baseline gap-3">
            <span className="text-section font-semibold tabular-nums text-text" aria-label={`${clock(session.left)} left`}>
              {clock(session.left)}
            </span>
            <span className="label">Answer out loud. Structure first, then your answer.</span>
          </p>
          <details className="mt-3">
            <summary className="label cursor-pointer">Record yourself (optional)</summary>
            <SpeakPractice />
          </details>
          <p className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={() => setSession((s) => ({ ...s, phase: 'followup', fu: 0 }))}>
              Done answering
            </button>
            <button type="button" className="btn" onClick={exit}>
              End session
            </button>
          </p>
        </section>
      )}

      {phase === 'followup' && (
        <section aria-label="Follow-up">
          <p className="label">
            Follow-up {session.fu + 1} of {followUps.length}
          </p>
          <p className="mt-2 text-section font-semibold leading-snug text-text">{followUps[session.fu]}</p>
          <p className="mt-1 text-text-muted">Answer out loud in under a minute, then continue.</p>
          <p className="mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setSession((s) => (s.fu + 1 < followUps.length ? { ...s, fu: s.fu + 1 } : { ...s, phase: 'review' }))}
            >
              {session.fu + 1 < followUps.length ? 'Next follow-up' : 'Review my answer'}
            </button>
          </p>
        </section>
      )}

      {phase === 'review' && <Review q={q} session={session} setSession={setSession} followUps={followUps} />}
    </Page>
  )
}

function Review({ q, session, setSession, followUps }) {
  const [ratings, setRatings] = useState({})
  const ready = interview.rubric.every((r) => ratings[r.key])
  const last = session.i === session.qs.length - 1
  const score = ready ? interview.rubric.reduce((n, r) => n + ratings[r.key], 0) / (interview.rubric.length * 5) : 0
  const sent = useRef(false)

  function next() {
    if (sent.current) return
    sent.current = true
    const comps = [...new Set([competencyData.categoryMap[q.category], 'communication'])]
    logEvent({ kind: 'interview', ref: `${session.started}-${session.i}`, comps, level: 4, score, self: true })
    const item = { id: q.id, question: q.question, score, ratings }
    setSession((s) => {
      const scores = [...s.scores, item]
      return last ? { ...s, scores, phase: 'summary' } : { ...s, scores, i: s.i + 1, phase: 'answer', left: s.cfg.minutes * 60, fu: 0 }
    })
  }

  return (
    <section aria-label="Review">
      <p className="label">Model answer</p>
      <div className="card mt-2 p-3">
        {q.sections.map((s) => (
          <Points key={s.label} label={s.label} points={s.points} />
        ))}
        {q.tip && <Points label="What they test" points={[q.tip]} />}
        <Points label="Failure mode" points={[q.failureMode]} />
      </div>
      <p className="mt-3 text-text-muted">
        <span className="label">Your follow-ups</span> {followUps.join(' · ')}
      </p>

      <h2 className="mt-6 text-section">Score yourself</h2>
      <p className="mt-1 text-text-muted">Pick the level that describes your answer, not the one you hoped for.</p>
      {interview.rubric.map((r) => (
        <fieldset key={r.key} className="mt-4">
          <legend className="font-semibold text-text">{r.name}</legend>
          <ul className="mt-1 space-y-1">
            {r.levels.map((l, i) => (
              <li key={l}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-text">
                  <input type="radio" name={r.key} className="size-5 accent-accent" checked={ratings[r.key] === i + 1} onChange={() => setRatings((x) => ({ ...x, [r.key]: i + 1 }))} />
                  <span>
                    <span className="label mr-2">{i + 1}</span>
                    {l}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ))}
      <p className="mt-6">
        <button type="button" className="btn btn-primary" disabled={!ready} onClick={next}>
          {last ? 'Finish and see summary' : 'Next question'}
        </button>
        {!ready && <span className="ml-3 text-text-muted">Score all five.</span>}
      </p>
    </section>
  )
}

function Summary({ session, exit }) {
  const saved = useRef(false)
  const items = session.scores
  const total = items.reduce((n, it) => n + it.score, 0) / items.length
  const band = bandFor(total)
  const per = interview.rubric.map((r) => ({ ...r, avg: items.reduce((n, it) => n + it.ratings[r.key], 0) / (items.length * 5) }))
  const ranked = [...per].sort((a, b) => a.avg - b.avg)
  const weakest = ranked[0]
  const strongest = ranked[ranked.length - 1]
  const focus = ranked.slice(0, 2)

  useEffect(() => {
    if (saved.current) return
    saved.current = true
    saveSession({ at: session.started, total, band: band.label, items: items.map((it) => ({ id: it.id, question: it.question, score: it.score })) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Page>
      <PageHead chapter="Interview simulator" title="Session summary" intro={`${items.length} ${items.length === 1 ? 'question' : 'questions'} · ${pct(total)}`} />
      <div className="card p-4">
        <p className="label">Readiness estimate</p>
        <p className="mt-1 text-section font-semibold text-text">{band.label}</p>
        <p className="mt-1 text-text-muted">{band.line}</p>
        <p className="mt-2 text-text-muted">This is an estimate from your own ratings. It is not a prediction of a hiring decision.</p>
      </div>
      <h2 className="mt-6 text-section">Scorecard</h2>
      <ul className="mt-2 border-t border-border">
        {per.map((r) => {
          const n = Math.round(r.avg * 5 * 10) / 10
          return (
            <li key={r.key} className="border-b border-border py-3">
              <p className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-text">{r.name}</span>
                <span className="tabular-nums text-text">{n}/5</span>
              </p>
              <p className="mt-1 text-text-muted">{r.levels[Math.min(4, Math.max(0, Math.round(n) - 1))]}</p>
            </li>
          )
        })}
      </ul>
      <h2 className="mt-6 text-section">Summary</h2>
      <p className="mt-2 text-text">
        Strongest: <strong>{strongest.name}</strong>. Weakest: <strong>{weakest.name}</strong>.
      </p>
      <h2 className="mt-6 text-section">Next steps</h2>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-text">
        {focus.map((r) => (
          <li key={r.key}>
            <strong>{r.name}.</strong> {r.next}
          </li>
        ))}
      </ol>
      <h2 className="mt-6 text-section">By question</h2>
      <ul className="mt-2 border-t border-border">
        {items.map((it) => (
          <li key={it.id} className="flex items-baseline justify-between gap-3 border-b border-border py-2">
            <Link to={`/browse/${it.id}`}>{it.question}</Link>
            <span className="tabular-nums text-text-muted">{pct(it.score)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={exit}>
          Another session
        </button>
        <Link to="/progress" className="btn no-underline hover:no-underline">
          My progress
        </Link>
      </p>
    </Page>
  )
}
