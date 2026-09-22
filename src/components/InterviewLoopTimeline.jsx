import { useState } from 'react'

/**
 * A generic PM interview loop as a horizontal timeline: numbered rounds
 * connected by a line, each independently expandable to say what it tests.
 * Stacks to one column on mobile, line moves to the left edge.
 *
 * @param {{ rounds: { name: string, tests: string }[] }} props
 */
export default function InterviewLoopTimeline({ rounds }) {
  const [open, setOpen] = useState(null)

  return (
    <div>
      {/* desktop: horizontal row */}
      <ol className="relative hidden gap-3 sm:flex">
        <span aria-hidden="true" className="absolute left-0 right-0 top-[19px] h-px bg-border" />
        {rounds.map((r, i) => {
          const on = open === i
          return (
            <li key={r.name} className="relative flex-1">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? null : i)}
                className="flex w-full flex-col items-center text-center"
              >
                <span
                  className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-pill border text-body font-semibold ${
                    on ? 'border-accent bg-accent text-surface' : 'border-border bg-surface text-text'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="mt-2 text-body font-semibold text-text">{r.name}</span>
              </button>
              {on && (
                <div className="card mt-2 p-3 text-left">
                  <p className="label">What it tests</p>
                  <p className="mt-1 text-text-muted">{r.tests}</p>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {/* mobile: stacked, line down the left edge */}
      <ol className="relative space-y-3 pl-8 sm:hidden">
        <span aria-hidden="true" className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
        {rounds.map((r, i) => {
          const on = open === i
          return (
            <li key={r.name} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-8 top-0 z-10 grid size-10 place-items-center rounded-pill border text-body font-semibold ${
                  on ? 'border-accent bg-accent text-surface' : 'border-border bg-surface text-text'
                }`}
              >
                {i + 1}
              </span>
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? null : i)}
                className="card flex min-h-11 w-full items-center px-3 py-2 text-left font-semibold text-text"
              >
                {r.name}
              </button>
              {on && (
                <div className="card mt-2 p-3">
                  <p className="label">What it tests</p>
                  <p className="mt-1 text-text-muted">{r.tests}</p>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
