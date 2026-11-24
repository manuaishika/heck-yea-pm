import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getLesson, lessons, levels, stepHref, stepTitle } from '../data/learn'
import { markLinkDone, resetProgress, updateProfile, useCompetencies, useLearnState, usePath, useSessions } from '../lib/learning'
import { levelLabel } from '../lib/competency'
import { stepsPerWeek } from '../lib/path'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

const KIND = {
  'lesson-quiz': 'Lesson check',
  'lesson-guided': 'Guided exercise',
  'lesson-independent': 'Independent exercise',
  rca: 'Root cause case',
  consumer: 'Consumer lab',
  interview: 'Mock interview',
  quiz: 'Skills quiz',
}
const WEEK = 7 * 24 * 3600 * 1000
const pct = (x) => `${Math.round(x * 100)}%`

function eventTitle(e) {
  if (e.kind.startsWith('lesson')) return getLesson(e.ref)?.title || e.ref
  if (e.kind === 'rca' || e.kind === 'consumer') return e.ref.replace(/-/g, ' ')
  return KIND[e.kind]
}

function StepRow({ s, onSkip }) {
  const icon = s.done ? '✓' : s.skipped ? '–' : '○'
  return (
    <li className={`flex items-start gap-3 border-b border-border py-2 ${s.skipped ? 'opacity-60' : ''}`}>
      <span aria-hidden="true" className={`mt-0.5 grid size-6 shrink-0 place-items-center border text-label font-semibold ${s.done ? 'border-accent bg-accent text-surface' : 'border-border text-text-muted'}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <Link to={stepHref(s)} className="font-semibold text-text no-underline hover:underline">
          {stepTitle(s)}
        </Link>
        <p className="text-text-muted">{s.why}</p>
        <span className="sr-only">{s.done ? 'done' : s.skipped ? 'skipped' : 'not done'}</span>
      </div>
      {s.type === 'link' && !s.skipped && (
        <button type="button" className="btn btn-sm shrink-0" aria-pressed={s.done} onClick={() => markLinkDone(s.key, !s.done)}>
          {s.done ? 'Done' : 'Mark done'}
        </button>
      )}
      {!s.done && (
        <button type="button" className="btn btn-sm shrink-0" onClick={() => onSkip(s.key)}>
          {s.skipped ? 'Add back' : 'I know this'}
        </button>
      )}
    </li>
  )
}

export default function Progress() {
  useHead({
    title: 'My progress',
    description: 'Your learning path, competency levels, weak areas and recent activity. Kept on your device.',
    path: '/progress',
  })
  const plan = usePath()
  const { states, events, weak } = useCompetencies()
  const sessions = useSessions()
  const { saved } = useLearnState()
  const [showAll, setShowAll] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const mine = events.filter((e) => e.kind !== 'quiz')
  const week = mine.filter((e) => e.t > Date.now() - WEEK)
  const goal = plan ? stepsPerWeek(plan.profile.hours || 5) : 0
  const doneThisWeek = new Set(week.filter((e) => ['lesson-quiz', 'rca', 'consumer', 'interview'].includes(e.kind)).map((e) => `${e.kind}:${e.ref}`)).size
  const recent = [...mine].sort((a, b) => b.t - a.t).slice(0, 8)
  const last = sessions[sessions.length - 1]
  const recommended = (slugs) =>
    lessons.filter((l) => l.competencies.some((c) => slugs.includes(c)) && !events.some((e) => e.kind === 'lesson-quiz' && e.ref === l.slug)).slice(0, 2)

  function toggleSkip(key) {
    const skip = new Set(plan.profile.skip || [])
    if (skip.has(key)) skip.delete(key)
    else skip.add(key)
    updateProfile({ skip: [...skip] })
  }

  const upcoming = plan ? plan.steps.filter((s) => !s.done) : []
  const stepsShown = showAll || !plan ? plan?.steps || [] : [...plan.steps.filter((s) => s.done).slice(-2), ...upcoming.slice(0, 6)]

  return (
    <Page>
      <PageHead
        chapter="My progress"
        title={plan ? plan.path.name : 'My progress'}
        intro={plan ? plan.path.goal : 'Your competency levels come from what you do. Set up a path to get a plan.'}
        aside={
          <Link to="/start" className="btn btn-sm no-underline hover:no-underline">
            {plan ? 'Edit goals' : 'Set up your path'}
          </Link>
        }
      />

      {plan && (
        <>
          <section aria-labelledby="next-h">
            <h2 id="next-h" className="text-section">
              Next
            </h2>
            {plan.next ? (
              <div className="card mt-2 p-4">
                <p className="label">{plan.next.stage}</p>
                <p className="mt-1 text-section font-semibold text-text">{stepTitle(plan.next)}</p>
                <p className="mt-1 text-text-muted">{plan.next.why}</p>
                <p className="mt-3">
                  <Link to={stepHref(plan.next)} className="btn btn-primary no-underline hover:no-underline">
                    Continue
                  </Link>
                </p>
              </div>
            ) : (
              <p className="card mt-2 p-4 text-text">You finished this path. Repeat the cases and mock interviews to keep the levels up.</p>
            )}
          </section>

          <section className="mt-8" aria-labelledby="goal-h">
            <h2 id="goal-h" className="text-section">
              This week
            </h2>
            <p className="mt-1 text-text">
              {doneThisWeek} of about {goal} activities · {plan.profile.hours || 5} hours a week
            </p>
            <span aria-hidden="true" className="mt-2 flex h-1 overflow-hidden bg-border">
              <span className="block h-full bg-accent" style={{ width: `${Math.min(100, (doneThisWeek / goal) * 100)}%` }} />
            </span>
          </section>

          <section className="mt-8" aria-labelledby="path-h">
            <h2 id="path-h" className="text-section">
              Your path
            </h2>
            <p className="mt-1 text-text-muted">
              {plan.doneCount} of {plan.total} steps done
            </p>
            <span aria-hidden="true" className="mt-2 flex h-1 overflow-hidden bg-border">
              <span className="block h-full bg-accent" style={{ width: `${plan.total ? (plan.doneCount / plan.total) * 100 : 0}%` }} />
            </span>
            <ul className="mt-3 border-t border-border">
              {stepsShown.map((s) => (
                <StepRow key={s.key} s={s} onSkip={toggleSkip} />
              ))}
            </ul>
            {plan.steps.length > stepsShown.length && (
              <button type="button" onClick={() => setShowAll(true)} className="btn btn-sm mt-3">
                Show all {plan.steps.length} steps
              </button>
            )}
          </section>
        </>
      )}

      <section className="mt-8" aria-labelledby="comp-h">
        <h2 id="comp-h" className="text-section">
          Competencies
        </h2>
        <p className="mt-1 text-text-muted">
          A level needs a 70% score at that level. Help (hints, worked steps) counts up to level 2. Self-scored work is marked.
        </p>
        <ul className="mt-2 border-t border-border">
          {states.map((c) => (
            <li key={c.slug} className="border-b border-border py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-text">{c.name}</span>
                <span className="label !text-text">{levelLabel(levels, c.level)}</span>
              </div>
              <span className="mt-2 flex gap-1" role="img" aria-label={`${c.level} of 4 levels reached`}>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={`h-1 flex-1 ${c.level >= n ? 'bg-accent' : 'bg-border'}`} />
                ))}
              </span>
              <p className="mt-1 text-text-muted">
                {c.attempts === 0
                  ? c.blurb
                  : `${c.independent} independent · ${c.assisted} assisted${c.self ? ` · ${c.self} self-scored` : ''}${c.avg !== null ? ` · recent ${pct(c.avg)}` : ''}`}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {weak.length > 0 && (
        <section className="mt-8" aria-labelledby="weak-h">
          <h2 id="weak-h" className="text-section">
            Weak spots
          </h2>
          <ul className="mt-2 border-t border-border">
            {weak.map((c) => (
              <li key={c.slug} className="border-b border-border py-3">
                <p className="font-semibold text-text">
                  {c.name} <span className="label">recent {pct(c.avg)}</span>
                </p>
                <p className="mt-1 text-text-muted">
                  {recommended([c.slug]).length > 0 ? (
                    <>
                      Try:{' '}
                      {recommended([c.slug]).map((l, i) => (
                        <span key={l.slug}>
                          {i > 0 && ', '}
                          <Link to={`/learn/${l.slug}`}>{l.title}</Link>
                        </span>
                      ))}
                    </>
                  ) : (
                    <>
                      Repeat your cases in <Link to="/practice">Practice</Link>.
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {last && (
        <section className="mt-8" aria-labelledby="ready-h">
          <h2 id="ready-h" className="text-section">
            Interview readiness
          </h2>
          <p className="mt-1 text-text">
            {last.band} · {pct(last.total)} in your last mock. It is an estimate from your own ratings, not a prediction.
          </p>
          <p className="mt-2">
            <Link to="/interview">Take another mock interview</Link>
          </p>
        </section>
      )}

      <section className="mt-8" aria-labelledby="recent-h">
        <h2 id="recent-h" className="text-section">
          Recent activity
        </h2>
        {recent.length === 0 ? (
          <p className="card mt-2 p-4 text-text-muted">
            Nothing yet. Start with <Link to="/learn">a lesson</Link> or <Link to="/practice">a case</Link>.
          </p>
        ) : (
          <ul className="mt-2 border-t border-border">
            {recent.map((e) => (
              <li key={`${e.t}-${e.kind}-${e.ref}`} className="flex items-baseline justify-between gap-3 border-b border-border py-2">
                <span className="text-text">
                  <span className="label mr-2">{KIND[e.kind]}</span>
                  {eventTitle(e)}
                </span>
                <span className="shrink-0 tabular-nums text-text-muted">
                  {pct(e.score)}
                  {e.assisted ? ' · assisted' : ''}
                  {e.self ? ' · self' : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {saved.length > 0 && (
        <section className="mt-8" aria-labelledby="saved-h">
          <h2 id="saved-h" className="text-section">
            Saved lessons
          </h2>
          <ul className="mt-2 space-y-1">
            {saved.map(getLesson).filter(Boolean).map((l) => (
              <li key={l.slug}>
                <Link to={`/learn/${l.slug}`}>{l.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 border-t border-border pt-4" aria-labelledby="data-h">
        <h2 id="data-h" className="label">
          Your data
        </h2>
        <p className="mt-1 text-text-muted">Everything here lives in this browser. Nothing is sent anywhere.</p>
        {confirm ? (
          <p className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-text">Delete your progress, saved lessons and sessions?</span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                resetProgress()
                setConfirm(false)
              }}
            >
              Yes, delete
            </button>
            <button type="button" className="btn btn-sm" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </p>
        ) : (
          <button type="button" className="btn btn-sm mt-2" onClick={() => setConfirm(true)}>
            Reset my progress
          </button>
        )}
      </section>
    </Page>
  )
}
