import { useState } from 'react'
import { Link } from 'react-router-dom'
import { quiz, getSkill } from '../data/guides'
import { categorySlug } from '../data/questions'
import { useQuiz } from '../lib/useQuiz'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'

const items = quiz.questions
const LETTERS = ['A', 'B', 'C', 'D', 'E']
const isTech = (slug) => getSkill(slug)?.track === 'technical'

function bandFor(score) {
  let band = quiz.bands[0]
  for (const b of quiz.bands) if (score >= b.min) band = b
  return band
}

/* ------------------------------------------------------------- one question */

function Question({ item, index, chosen, onPick, onNext, isLast }) {
  const answered = chosen !== undefined
  const skill = getSkill(item.skill)

  return (
    <div className="mt-4">
      <p className="label" aria-live="polite">
        {index + 1} / {items.length} · {isTech(item.skill) ? 'technical' : 'non-technical'} ·{' '}
        {skill.name}
      </p>
      <span
        className="mt-1.5 block h-2.5 overflow-hidden rounded-[3px] border-2 border-ink bg-paper"
        aria-hidden="true"
      >
        <span
          className="block h-full bg-accent transition-[width] duration-200"
          style={{ width: `${((index + (answered ? 1 : 0)) / items.length) * 100}%` }}
        />
      </span>

      <h2 className="mt-4 text-lg leading-snug">{item.q}</h2>

      <ul className="mt-3 space-y-2">
        {item.options.map((opt, i) => {
          const isAnswer = i === item.answer
          const isChosen = i === chosen
          let state = 'bg-paper hover:bg-paper-2'
          if (answered && isAnswer) state = 'bg-ink text-paper'
          else if (answered && isChosen) state = 'bg-accent-quiet !border-accent'
          else if (answered) state = 'bg-paper opacity-60'
          return (
            <li key={i}>
              <button
                type="button"
                disabled={answered}
                onClick={() => onPick(i)}
                className={`flex w-full items-start gap-3 rounded-[6px] border-2 border-ink px-3 py-2 text-left text-sm ${state} ${
                  item.mono ? 'font-mono text-xs' : ''
                }`}
              >
                <span className="label shrink-0 pt-px !text-current">{LETTERS[i]}</span>
                <span className="min-w-0 flex-1">{opt}</span>
                {answered && isAnswer && (
                  <span aria-label="correct answer" className="font-bold">
                    ✓
                  </span>
                )}
                {answered && isChosen && !isAnswer && (
                  <span aria-label="your answer, wrong" className="font-bold">
                    ✗
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {answered && (
        <div className="panel mt-3 p-3" role="status">
          <p className="label !text-ink">{chosen === item.answer ? 'Right' : 'Not quite'}</p>
          <p className="mt-1 text-sm text-ink-dim">{item.why}</p>
        </div>
      )}

      {answered && (
        <p className="mt-4">
          <button type="button" onClick={onNext} className="btn btn-primary">
            {isLast ? 'See where you stand' : 'Next →'}
          </button>
        </p>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- the read */

function Ladder({ score }) {
  const total = items.length
  const stops = quiz.bands.map((b, i) => {
    const end = i + 1 < quiz.bands.length ? quiz.bands[i + 1].min : total + 1
    return { ...b, size: end - b.min }
  })
  const totalSize = stops.reduce((n, s) => n + s.size, 0)
  const pos = (score / total) * 100
  const here = bandFor(score).label

  return (
    <div className="mt-4">
      <div className="relative pt-3">
        <span
          aria-hidden="true"
          className="absolute top-0 -translate-x-1/2 text-xs font-bold text-ink"
          style={{ left: `${Math.min(Math.max(pos, 3), 97)}%` }}
        >
          ▼
        </span>
        <div className="flex h-3 overflow-hidden rounded-[3px] border-2 border-ink">
          {stops.map((s, i) => (
            <span
              key={s.label}
              className={`h-full ${i < stops.length - 1 ? 'border-r-2 border-ink' : ''} ${
                here === s.label ? 'bg-accent' : 'bg-paper'
              }`}
              style={{ width: `${(s.size / totalSize) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-1 flex">
        {stops.map((s) => (
          <span
            key={s.label}
            className={`label ${here === s.label ? '!text-ink font-bold' : ''}`}
            style={{ width: `${(s.size / totalSize) * 100}%` }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function Track({ label, correct, total }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="label">
          {correct} / {total}
        </span>
      </div>
      <span
        className="mt-1 flex h-2.5 overflow-hidden rounded-[3px] border-2 border-ink bg-paper"
        aria-hidden="true"
      >
        <span className="block h-full bg-accent" style={{ width: `${(correct / total) * 100}%` }} />
      </span>
    </div>
  )
}

function Results({ answers, onRetake }) {
  const graded = items.map((it) => ({
    it,
    ok: answers[it.skill] === it.answer,
    skill: getSkill(it.skill),
  }))
  const score = graded.filter((g) => g.ok).length
  const band = bandFor(score)
  const techItems = graded.filter((g) => isTech(g.it.skill))
  const nonItems = graded.filter((g) => !isTech(g.it.skill))
  const missed = graded.filter((g) => !g.ok)

  return (
    <div className="mt-4">
      <div className="card p-4">
        <p className="label">Your result</p>
        <p className="mt-1 text-xl font-bold tracking-tight text-ink">
          {score} / {items.length} · {band.label}
        </p>
        <p className="mt-2 text-sm text-ink-dim">{band.line}</p>
        <Ladder score={score} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Track
          label="Technical"
          correct={techItems.filter((g) => g.ok).length}
          total={techItems.length}
        />
        <Track
          label="Non-technical"
          correct={nonItems.filter((g) => g.ok).length}
          total={nonItems.length}
        />
      </div>

      {missed.length > 0 ? (
        <>
          <h2 className="mt-6 text-lg">Start with these</h2>
          <p className="mt-1 text-sm text-ink-dim">
            The skills you missed. Read each, then work its questions.
          </p>
          <ol className="mt-2 border-t-2 border-rule-hard">
            {missed.slice(0, 6).map(({ skill }) => (
              <li key={skill.slug} className="border-b border-rule py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-ink">{skill.name}</span>
                  <span className="label shrink-0">
                    {isTech(skill.slug) ? 'technical' : 'non-technical'}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-ink-dim">{skill.gist}</p>
                <p className="mt-1 flex gap-4 text-sm">
                  <Link to={`/skills#${skill.slug}`}>Read the skill</Link>
                  <Link to={`/browse?category=${categorySlug(skill.bankCategory)}`}>
                    {skill.bankCategory} questions
                  </Link>
                </p>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="mt-6 text-sm text-ink-dim">
          No misses. Go to the <Link to="/browse">questions</Link> and the{' '}
          <Link to="/companies">company loops</Link>.
        </p>
      )}

      <h2 className="mt-6 text-lg">Every question</h2>
      <ul className="mt-2 border-t-2 border-rule-hard">
        {graded.map(({ it, ok, skill }) => (
          <li
            key={it.skill}
            className="flex items-baseline gap-3 border-b border-rule py-1.5 text-sm"
          >
            <span className="w-4 shrink-0 font-bold text-ink" aria-label={ok ? 'correct' : 'missed'}>
              {ok ? '✓' : '✗'}
            </span>
            <span className="text-ink">{skill.name}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onRetake} className="btn">
          Retake
        </button>
        <Link to="/browse" className="btn btn-primary no-underline">
          Questions
        </Link>
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------- page */

export default function Assess() {
  const { answers, answer, reset, canPersist } = useQuiz()
  useHead({
    title: 'Where do you stand?',
    description:
      'A 15-question quiz across the technical and non-technical PM skills, with a read on where you stand and what to fix first.',
    path: '/skills/assess',
  })

  const answeredCount = items.filter((it) => it.skill in answers).length
  const complete = answeredCount === items.length
  const firstOpen = items.findIndex((it) => !(it.skill in answers))

  // `cursor` lets someone move on after answering; it never runs ahead of the answers
  const [cursor, setCursor] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const index = cursor ?? (firstOpen === -1 ? items.length - 1 : firstOpen)
  const item = items[index]
  const isLast = index === items.length - 1

  function next() {
    if (isLast) setShowResults(true)
    else setCursor(index + 1)
  }

  function retake() {
    reset()
    setCursor(0)
    setShowResults(false)
  }

  const viewingResults = complete && (showResults || cursor === null)

  return (
    <Page>
      <PageHead
        chapter="Chapter 2"
        title="Where do you stand?"
        intro={`${items.length} questions, one per skill. You see the answer after each one, then a read on where you stand and what to fix first.`}
      />

      {!canPersist && (
        <p className="prose-body mt-3">
          This browser is not storing data, so your answers will not be here when you come back.
        </p>
      )}

      {viewingResults ? (
        <Results answers={answers} onRetake={retake} />
      ) : (
        <Question
          key={item.skill}
          item={item}
          index={index}
          chosen={answers[item.skill]}
          onPick={(i) => {
            setCursor(index) // stay on this question so the feedback shows
            answer(item.skill, i)
          }}
          onNext={next}
          isLast={isLast}
        />
      )}

      {!viewingResults && answeredCount > 0 && (
        <p className="mt-6">
          <button type="button" onClick={retake} className="chip">
            start over
          </button>
        </p>
      )}
    </Page>
  )
}
