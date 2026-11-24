import { useEffect, useRef, useState } from 'react'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

/**
 * A short multiple-choice check. Each question locks once answered and shows
 * why. When every question is answered it reports the score once; "Try again"
 * clears the answers so a retake is a fresh attempt.
 */
export default function Mcq({ questions, onDone }) {
  const [picked, setPicked] = useState({})
  const reported = useRef(false)
  const answered = Object.keys(picked).length
  const complete = answered === questions.length
  const score = questions.filter((q, i) => picked[i] === q.answer).length

  useEffect(() => {
    if (complete && !reported.current) {
      reported.current = true
      onDone?.(score, questions.length)
    }
  }, [complete]) // eslint-disable-line react-hooks/exhaustive-deps

  function retake() {
    reported.current = false
    setPicked({})
  }

  return (
    <div>
      {questions.map((q, i) => {
        const chosen = picked[i]
        const done = chosen !== undefined
        return (
          <div key={q.q} className={i > 0 ? 'mt-6' : ''}>
            <p className="font-semibold text-text">
              {i + 1}. {q.q}
            </p>
            <ul className="mt-2 space-y-2">
              {q.options.map((opt, j) => {
                let state = 'bg-surface hover:border-accent'
                if (done && j === q.answer) state = 'bg-correct text-on-answer !border-correct'
                else if (done && j === chosen) state = 'bg-wrong text-on-answer !border-wrong'
                else if (done) state = 'bg-surface opacity-60'
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      disabled={done}
                      onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                      className={`flex min-h-11 w-full items-start gap-3 rounded-button border border-border px-3 py-2 text-left text-body ${state}`}
                    >
                      <span className="label shrink-0 pt-px !text-current">{LETTERS[j]}</span>
                      <span className="min-w-0 flex-1">{opt}</span>
                      {done && j === q.answer && <span aria-label="correct answer">✓</span>}
                      {done && j === chosen && j !== q.answer && <span aria-label="your answer, wrong">✗</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
            {done && (
              <p className={`card mt-2 border-l-4 p-3 text-text-muted ${chosen === q.answer ? '!border-l-correct' : '!border-l-wrong'}`} role="status">
                <span className="label !text-text">{chosen === q.answer ? '✓ Right' : '✗ Not quite'}</span> {q.why}
              </p>
            )}
          </div>
        )
      })}
      {complete && (
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <p className="text-section font-semibold text-text">
            {score} of {questions.length}
          </p>
          <button type="button" onClick={retake} className="btn btn-sm">
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
