import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { disciplines, lessons, getCompetency, levels } from '../data/learn'
import { toggleSavedLesson, useEvents, useLearnState } from '../lib/learning'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

const AUDIENCES = [
  ['aspiring', 'Aspiring'],
  ['working', 'Working'],
  ['technical', 'Technical'],
]

function LessonRow({ lesson, done, saved }) {
  return (
    <li className="flex items-start gap-3 border-b border-border py-3">
      <span
        aria-hidden="true"
        className={`mt-1 grid size-6 shrink-0 place-items-center border text-label font-semibold ${done ? 'border-accent bg-accent text-surface' : 'border-border text-text-muted'}`}
      >
        {done ? '✓' : lesson.level}
      </span>
      <div className="min-w-0 flex-1">
        <Link to={`/learn/${lesson.slug}`} className="font-semibold text-text no-underline hover:underline">
          {lesson.title}
        </Link>
        <p className="mt-0.5 text-text-muted">
          {lesson.topic} · {lesson.minutes} min · {levels[lesson.level - 1].name}
          {done && <span className="sr-only"> (assessment taken)</span>}
        </p>
        <p className="label mt-1">{lesson.competencies.map((c) => getCompetency(c).name).join(' · ')}</p>
      </div>
      <button
        type="button"
        onClick={() => toggleSavedLesson(lesson.slug)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${lesson.title} from saved lessons` : `Save ${lesson.title}`}
        className="btn btn-sm min-w-11 shrink-0"
      >
        {saved ? 'Saved' : 'Save'}
      </button>
    </li>
  )
}

export default function Learn() {
  useHead({
    title: 'Learn',
    description:
      'Short product management lessons by discipline: consumer research, analytics, technical foundations, AI and execution. Each one ends with an exercise and a check.',
    path: '/learn',
  })
  const events = useEvents()
  const { saved } = useLearnState()
  const [q, setQ] = useState('')
  const [level, setLevel] = useState(0)
  const [audience, setAudience] = useState('')
  const [onlySaved, setOnlySaved] = useState(false)

  const done = useMemo(() => new Set(events.filter((e) => e.kind === 'lesson-quiz').map((e) => e.ref)), [events])
  const needle = q.trim().toLowerCase()
  const shown = lessons.filter(
    (l) =>
      (!level || l.level === level) &&
      (!audience || l.audience.includes(audience)) &&
      (!onlySaved || saved.includes(l.slug)) &&
      (!needle ||
        `${l.title} ${l.topic} ${l.terms.map((t) => t.term).join(' ')} ${l.definition}`.toLowerCase().includes(needle))
  )
  const filtering = Boolean(needle || level || audience || onlySaved)

  return (
    <Page>
      <PageHead
        chapter="Learn"
        title="Lessons"
        intro={`${lessons.length} lessons across ${disciplines.filter((d) => lessons.some((l) => l.discipline === d.slug)).length} disciplines. Each has an exercise and a check.`}
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 basis-56">
          <label htmlFor="lesson-search" className="label block">
            Find a concept
          </label>
          <input
            id="lesson-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="funnel, API, RICE…"
            autoComplete="off"
            className="mt-1 min-h-11 w-full border border-border bg-surface px-3 text-[16px] text-text"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filters">
        {levels.map((l) => (
          <button key={l.level} type="button" aria-pressed={level === l.level} onClick={() => setLevel(level === l.level ? 0 : l.level)} className="pill">
            {l.level} · {l.name}
          </button>
        ))}
        {AUDIENCES.map(([k, label]) => (
          <button key={k} type="button" aria-pressed={audience === k} onClick={() => setAudience(audience === k ? '' : k)} className="pill">
            {label}
          </button>
        ))}
        <button type="button" aria-pressed={onlySaved} onClick={() => setOnlySaved((v) => !v)} className="pill">
          Saved {saved.length > 0 && `(${saved.length})`}
        </button>
      </div>

      {filtering ? (
        <section className="mt-6" aria-label="Results">
          <p className="label" aria-live="polite">
            {shown.length} {shown.length === 1 ? 'lesson' : 'lessons'}
          </p>
          {shown.length > 0 ? (
            <ul className="mt-2 border-t border-border">
              {shown.map((l) => (
                <LessonRow key={l.slug} lesson={l} done={done.has(l.slug)} saved={saved.includes(l.slug)} />
              ))}
            </ul>
          ) : (
            <p className="card mt-2 p-4 text-text-muted">Nothing matches. Clear a filter.</p>
          )}
        </section>
      ) : (
        disciplines.map((d) => {
          const mine = lessons.filter((l) => l.discipline === d.slug)
          const written = new Set(mine.map((l) => l.topic.toLowerCase()))
          const planned = (d.planned || []).filter((p) => !written.has(p.toLowerCase()))
          return (
            <section key={d.slug} className="mt-8" aria-labelledby={`d-${d.slug}`}>
              <h2 id={`d-${d.slug}`} className="text-section">
                {d.name}
              </h2>
              {mine.length > 0 && (
                <ul className="mt-2 border-t border-border">
                  {mine.map((l) => (
                    <LessonRow key={l.slug} lesson={l} done={done.has(l.slug)} saved={saved.includes(l.slug)} />
                  ))}
                </ul>
              )}
              {planned.length > 0 && (
                <p className="mt-2 text-text-muted">
                  <span className="label">Not written yet</span> {planned.join(', ')}
                </p>
              )}
            </section>
          )
        })
      )}
    </Page>
  )
}
