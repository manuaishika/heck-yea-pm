import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cases, getCompetency, getLesson, levels } from '../data/learn'
import { logEvent, saveNote, toggleSavedLesson, useEvents, useLearnState } from '../lib/learning'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import Mcq from '../components/Mcq'
import BackLink from '../components/BackLink'
import NotFound from './NotFound'

function Section({ n, title, children }) {
  return (
    <section className="mt-8" aria-labelledby={`s${n}`}>
      <h2 id={`s${n}`} className="text-section">
        <span className="label mr-2">{n}</span>
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function Bullets({ items }) {
  return (
    <ul className="space-y-1">
      {items.map((p) => (
        <li key={p} className="flex gap-3 leading-relaxed text-text">
          <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 bg-text" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  )
}

function Steps({ items }) {
  return (
    <ol className="space-y-2">
      {items.map((p, i) => (
        <li key={p} className="flex gap-3 leading-relaxed text-text">
          <span aria-hidden="true" className="label mt-1 w-5 shrink-0 text-right">
            {i + 1}
          </span>
          <span>{p}</span>
        </li>
      ))}
    </ol>
  )
}

export default function LessonDetail() {
  const { slug } = useParams()
  const lesson = getLesson(slug)
  if (!lesson) return <NotFound />
  return <Lesson key={lesson.slug} lesson={lesson} />
}

function Lesson({ lesson }) {
  const events = useEvents()
  const { saved, notes } = useLearnState()
  const [shown, setShown] = useState(false)
  const [rubric, setRubric] = useState([])
  const [scored, setScored] = useState(null)
  const [note, setNote] = useState(notes[lesson.slug] || '')

  useHead({
    title: lesson.title,
    description: `${lesson.definition} ${lesson.minutes}-minute lesson with an exercise and a check.`.replace(/\s+/g, ' ').slice(0, 155),
    path: `/learn/${lesson.slug}`,
  })

  const mine = events.filter((e) => e.ref === lesson.slug)
  const lastQuiz = [...mine].reverse().find((e) => e.kind === 'lesson-quiz')
  const guidedLogged = mine.some((e) => e.kind === 'lesson-guided')
  const isSaved = saved.includes(lesson.slug)
  const indLevel = Math.max(2, Math.min(lesson.level + 1, 3))

  // note autosave after a pause
  useEffect(() => {
    if (note === (notes[lesson.slug] || '')) return undefined
    const id = setTimeout(() => saveNote(lesson.slug, note), 600)
    return () => clearTimeout(id)
  }, [note]) // eslint-disable-line react-hooks/exhaustive-deps

  const related = useMemo(() => cases.filter((c) => c.learnMore.includes(lesson.slug)), [lesson.slug])
  const prereqs = (lesson.prerequisites || []).map(getLesson)
  const done = (s) => events.some((e) => e.kind === 'lesson-quiz' && e.ref === s)

  function showSteps() {
    setShown(true)
    if (!guidedLogged) logEvent({ kind: 'lesson-guided', ref: lesson.slug, comps: lesson.competencies, level: 2, score: 1, assisted: true })
  }
  function saveScore() {
    const score = rubric.length / lesson.independent.rubric.length
    setScored(score)
    logEvent({ kind: 'lesson-independent', ref: lesson.slug, comps: lesson.competencies, level: indLevel, score, self: true })
  }

  return (
    <Page>
      <BackLink to="/learn" />
      <PageHead
        chapter="Lesson"
        title={lesson.title}
        intro={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              {lesson.minutes} min · {levels[lesson.level - 1].name}
            </span>
            {lastQuiz && <span className="label !text-text">Assessment: {Math.round(lastQuiz.score * lesson.assessment.length)} of {lesson.assessment.length}</span>}
          </span>
        }
        aside={
          <button type="button" onClick={() => toggleSavedLesson(lesson.slug)} aria-pressed={isSaved} className="btn btn-sm">
            {isSaved ? 'Saved' : 'Save'}
          </button>
        }
      />

      <p className="label">{lesson.competencies.map((c) => getCompetency(c).name).join(' · ')}</p>
      {prereqs.length > 0 && (
        <p className="mt-3 text-text-muted">
          <span className="label">Before this</span>{' '}
          {prereqs.map((p, i) => (
            <span key={p.slug}>
              {i > 0 && ', '}
              <Link to={`/learn/${p.slug}`}>{p.title}</Link>
              {done(p.slug) && ' ✓'}
            </span>
          ))}
        </p>
      )}

      <Section n={1} title="Learning objectives">
        <Bullets items={lesson.objectives} />
      </Section>
      <Section n={2} title="Definition">
        <p className="leading-relaxed text-text">{lesson.definition}</p>
      </Section>
      <Section n={3} title="Why it matters">
        <p className="leading-relaxed text-text">{lesson.whyItMatters}</p>
      </Section>
      <Section n={4} title="How it works">
        <Steps items={lesson.howItWorks} />
      </Section>
      <Section n={5} title="Terminology">
        <dl className="border-t border-border">
          {lesson.terms.map((t) => (
            <div key={t.term} className="grid gap-1 border-b border-border py-2 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="font-semibold text-text">{t.term}</dt>
              <dd className="text-text-muted">{t.def}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section n={6} title="Practical examples">
        <div className="grid gap-3 md:grid-cols-2">
          {lesson.examples.map((e) => (
            <div key={e.title} className="card p-3">
              <p className="font-semibold text-text">{e.title}</p>
              <p className="mt-1 leading-relaxed text-text-muted">{e.text}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section n={7} title="Real-world applications">
        <Bullets items={lesson.realWorld} />
      </Section>
      <Section n={8} title="Common mistakes">
        <Bullets items={lesson.mistakes} />
      </Section>
      <Section n={9} title="Why things fail">
        <Bullets items={lesson.whyThingsFail} />
      </Section>
      <Section n={10} title="Trade-offs and limitations">
        <Bullets items={lesson.tradeoffs} />
      </Section>

      <Section n={11} title="Guided exercise">
        <div className="card p-4">
          <p className="font-semibold text-text">{lesson.guided.prompt}</p>
          <p className="mt-1 text-text-muted">Try it yourself first. The worked steps count as assisted practice.</p>
          {shown ? (
            <div className="mt-3 border-t border-border pt-3">
              <Steps items={lesson.guided.steps} />
            </div>
          ) : (
            <button type="button" onClick={showSteps} className="btn mt-3">
              Show the worked steps
            </button>
          )}
        </div>
      </Section>

      <Section n={12} title="Independent exercise">
        <div className="card p-4">
          <p className="font-semibold text-text">{lesson.independent.prompt}</p>
          <label htmlFor="ind-note" className="label mt-3 block">
            Your answer · saved on this device only
          </label>
          <textarea
            id="ind-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            className="mt-1 w-full border border-border bg-surface p-3 text-[16px] text-text"
          />
          <fieldset className="mt-3">
            <legend className="label">Check yourself: tick what your answer does</legend>
            <ul className="mt-2 space-y-1">
              {lesson.independent.rubric.map((r) => (
                <li key={r}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-text">
                    <input
                      type="checkbox"
                      className="size-5 accent-accent"
                      checked={rubric.includes(r)}
                      onChange={(e) => {
                        setScored(null)
                        setRubric((cur) => (e.target.checked ? [...cur, r] : cur.filter((x) => x !== r)))
                      }}
                    />
                    <span>{r}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <p className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={saveScore} className="btn">
              Save my score
            </button>
            {scored !== null && (
              <span role="status" className="text-text">
                {rubric.length} of {lesson.independent.rubric.length} · you scored yourself, so it counts as self-rated
              </span>
            )}
          </p>
        </div>
      </Section>

      <Section n={13} title="Knowledge assessment">
        <div className="card p-4">
          <Mcq
            questions={lesson.assessment}
            onDone={(score, total) =>
              logEvent({ kind: 'lesson-quiz', ref: lesson.slug, comps: lesson.competencies, level: 1, score: score / total })
            }
          />
        </div>
      </Section>

      <Section n={14} title="Suggested next">
        <ul className="space-y-1">
          {(lesson.next || []).map(getLesson).map((n) => (
            <li key={n.slug}>
              <Link to={`/learn/${n.slug}`}>{n.title}</Link>
            </li>
          ))}
          {related.map((c) => (
            <li key={c.slug}>
              <span className="label mr-2">Practise</span>
              <Link to={`/practice/rca/${c.slug}`}>{c.title}</Link>
            </li>
          ))}
          <li>
            <Link to="/learn">All lessons</Link>
          </li>
        </ul>
        {lesson.references && (
          <p className="mt-4 text-text-muted">
            <span className="label">Further reading</span> {lesson.references.map((r) => r.label).join(' · ')}
          </p>
        )}
      </Section>
    </Page>
  )
}
