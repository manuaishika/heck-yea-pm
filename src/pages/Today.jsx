import { useState } from 'react'
import { Link } from 'react-router-dom'
import { questions, shortAnswer } from '../data/questions'
import { dayKey, dayNumber, useActivity } from '../lib/useActivity'
import { questionForDay } from '../lib/daily'
import { useReviews } from '../lib/useReviews'
import { readJSON, writeJSON } from '../lib/storage'
import { useHead } from '../lib/useHead'
import { Page, PageHead } from '../components/Page'
import { CategoryTag } from '../components/ui'
import Points from '../components/Points'

const INTERVIEW_KEY = 'pp.interview'
const field = 'min-h-11 border border-border bg-surface px-3 text-[16px] text-text'

/* ------------------------------------------------------------------ streak */

function Streak({ streak, doneToday, week }) {
  return (
    <section className="card p-4" aria-label="Streak">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-section font-semibold text-text">
          {streak > 0 ? `${streak} day streak` : 'No streak yet'}
        </p>
        <p className="label">{doneToday ? 'Done today' : 'Not done today'}</p>
      </div>
      <ol className="mt-3 grid grid-cols-7 gap-1.5">
        {week.map((d) => (
          <li
            key={d.key}
            aria-label={`${d.key}${d.done ? ', practised' : ''}${d.today ? ', today' : ''}`}
            className={`grid h-11 place-items-center border text-body font-semibold ${
              d.done ? 'border-accent bg-accent text-surface' : d.today ? 'border-accent text-text' : 'border-border text-text-muted'
            }`}
          >
            {d.done ? '✓' : d.letter}
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ---------------------------------------------------------------- the card */

function QuestionCard({ q, label, onRate, rated, onNext }) {
  const [revealed, setRevealed] = useState(false)
  const [full, setFull] = useState(false)
  return (
    <section className="card mt-4 p-4" aria-label="Question">
      <div className="flex items-center justify-between gap-2">
        <CategoryTag category={q.category} />
        <span className="label">{label}</span>
      </div>
      <h2 className="mt-3 text-section leading-snug">{q.question}</h2>

      {!revealed ? (
        <>
          <p className="mt-2 text-text-muted">Think for a minute. Say your answer out loud.</p>
          <button type="button" onClick={() => setRevealed(true)} className="btn btn-primary mt-4">
            Show model answer
          </button>
        </>
      ) : (
        <>
          <Points label="Answer" points={shortAnswer(q)} />
          <button
            type="button"
            className="label mt-3 flex min-h-11 items-center text-accent"
            aria-expanded={full}
            onClick={() => setFull((v) => !v)}
          >
            {full ? 'Hide full answer' : 'Full answer'}
          </button>
          {full && (
            <>
              {q.sections.map((s) => (
                <Points key={s.label} label={s.label} points={s.points} />
              ))}
              {q.tip && <Points label="What they test" points={[q.tip]} />}
              <Points label="Failure mode" points={[q.failureMode]} />
            </>
          )}

          {rated ? (
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-body font-semibold text-text">
                {rated === 'known' ? 'Marked known.' : 'Marked needs work. It comes back in your flashcards.'}
              </p>
              <p className="mt-3 flex flex-wrap gap-3">
                <button type="button" onClick={onNext} className="btn btn-primary">
                  Another question
                </button>
                <Link to={`/browse/${q.id}`} className="btn no-underline hover:no-underline">
                  Open question page
                </Link>
              </p>
            </div>
          ) : (
            <div className="mt-5 border-t border-border pt-4">
              <p className="label">How did you do?</p>
              <p className="mt-2 flex flex-wrap gap-3">
                <button type="button" onClick={() => onRate('known')} className="btn btn-primary">
                  Nailed it
                </button>
                <button type="button" onClick={() => onRate('review')} className="btn">
                  Needs work
                </button>
              </p>
            </div>
          )}
        </>
      )}
    </section>
  )
}

/* -------------------------------------------------------------- the plan */

function Plan({ rated }) {
  const [date, setDate] = useState(() => {
    const saved = readJSON(INTERVIEW_KEY, null)
    return typeof saved === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(saved) ? saved : ''
  })
  const [editing, setEditing] = useState(false)

  function save(next) {
    setDate(next)
    if (next) writeJSON(INTERVIEW_KEY, next)
    else writeJSON(INTERVIEW_KEY, null)
    setEditing(false)
  }

  const now = new Date()
  const today = dayNumber(now)
  const [y, m, d] = date ? date.split('-').map(Number) : []
  const daysLeft = date ? dayNumber(new Date(y, m - 1, d)) - today : 0
  const left = questions.length - rated

  return (
    <section className="card mt-4 p-4" aria-label="Interview plan">
      <p className="label">Interview date</p>
      {!date || editing ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label htmlFor="interview-date" className="sr-only">
            Interview date
          </label>
          <input
            id="interview-date"
            type="date"
            min={dayKey(now)}
            defaultValue={date}
            onChange={(e) => e.target.value && save(e.target.value)}
            className={field}
          />
          {!date && <p className="text-text-muted">Set it and get a daily target.</p>}
        </div>
      ) : daysLeft < 0 ? (
        <p className="mt-2 text-text-muted">That date has passed.</p>
      ) : daysLeft === 0 ? (
        <p className="mt-2 text-section font-semibold text-text">Today. Good luck.</p>
      ) : (
        <>
          <p className="mt-2 text-section font-semibold text-text">
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
          </p>
          {left > 0 ? (
            <p className="mt-1 text-text-muted">
              {left} of {questions.length} questions not rated yet. {Math.ceil(left / daysLeft)} a day covers them.
            </p>
          ) : (
            <p className="mt-1 text-text-muted">
              Every question is rated. Redo the ones marked needs work in <Link to="/flashcards">flashcards</Link>.
            </p>
          )}
        </>
      )}
      {date && (
        <p className="mt-3 flex gap-4 text-body">
          <button type="button" onClick={() => setEditing((v) => !v)} className="underline underline-offset-2">
            {editing ? 'Cancel' : 'Change date'}
          </button>
          <button type="button" onClick={() => save('')} className="underline underline-offset-2">
            Clear
          </button>
        </p>
      )}
    </section>
  )
}

/* ------------------------------------------------------------- reminder */

/** A daily calendar event as a file — no account, no server. Floating local time. */
function reminderFile(time) {
  const [hh, mm] = time.split(':')
  const start = new Date()
  start.setDate(start.getDate() + 1)
  const stamp = `${start.getFullYear()}${String(start.getMonth() + 1).padStart(2, '0')}${String(start.getDate()).padStart(2, '0')}`
  const url = `${window.location.origin}/today`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Product Practice//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:daily-reminder@product-practice',
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${stamp}T${hh}${mm}00`,
    'DURATION:PT10M',
    'RRULE:FREQ=DAILY',
    "SUMMARY:Product Practice - today's question",
    `DESCRIPTION:One question. Say your answer out loud.\\n${url}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    "DESCRIPTION:Today's question",
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function Reminder() {
  const [time, setTime] = useState('20:00')
  function download() {
    const blob = new Blob([reminderFile(time)], { type: 'text/calendar;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'product-practice-reminder.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  return (
    <section className="card mt-4 p-4" aria-label="Daily reminder">
      <p className="label">Daily reminder</p>
      <p className="mt-2 text-text-muted">A repeating calendar event that opens this page. No account needed.</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label htmlFor="reminder-time" className="sr-only">
          Reminder time
        </label>
        <input id="reminder-time" type="time" value={time} onChange={(e) => setTime(e.target.value || '20:00')} className={field} />
        <button type="button" onClick={download} className="btn">
          Add to calendar
        </button>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------- page */

export default function Today() {
  useHead({
    title: 'Today’s question',
    description:
      'One product interview question a day, the same for everyone. Say your answer, check the model answer, keep your streak.',
    path: '/today',
  })

  const { streak, doneToday, week, log } = useActivity()
  const { marks, mark } = useReviews()
  const [extra, setExtra] = useState(0)
  const [rated, setRated] = useState(null)

  const q = questionForDay(dayNumber(), extra)
  const ratedCount = questions.filter((x) => marks[x.id]).length

  function rate(status) {
    mark(q.id, status)
    log()
    setRated(status)
  }
  function next() {
    setExtra((n) => n + 1)
    setRated(null)
  }

  return (
    <Page>
      <PageHead chapter="Daily" title="Today’s question" intro="One question a day. Everyone gets the same one." />
      <Streak streak={streak} doneToday={doneToday} week={week} />
      <QuestionCard
        key={q.id}
        q={q}
        label={extra === 0 ? 'Today' : `Extra ${extra}`}
        rated={rated}
        onRate={rate}
        onNext={next}
      />
      <Plan rated={ratedCount} />
      <Reminder />
      <p className="mt-6 border-t border-border pt-4 text-text-muted">
        <Link to="/browse">All questions</Link>
      </p>
    </Page>
  )
}
