import { useEffect, useRef, useState } from 'react'

/**
 * A generic PM interview loop as a horizontal timeline: numbered rounds
 * connected by a line, each independently expandable to say what it tests.
 * Stacks to one column on mobile, line moves to the left edge.
 *
 * Motion: the connector line draws itself in once the section is on screen,
 * and the rounds pulse-highlight themselves one after another until the
 * visitor hovers (desktop) or taps (mobile) a round — at that point the
 * auto-cycle stops and that round expands. Everything here is skipped when
 * the visitor prefers reduced motion; only the plain expand/collapse stays.
 *
 * @param {{ rounds: { name: string, tests: string }[] }} props
 */
export default function InterviewLoopTimeline({ rounds }) {
  const [open, setOpen] = useState(null)
  const [active, setActive] = useState(0)
  const [pulseTick, setPulseTick] = useState(0)
  const [inView, setInView] = useState(false)
  const [autoCycling, setAutoCycling] = useState(true)
  const rootRef = useRef(null)

  // the line only draws in, and the auto-cycle only starts, once this
  // section is actually visible — not the instant the page loads
  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || !autoCycling) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = setInterval(() => {
      setActive((a) => (a + 1) % rounds.length)
      setPulseTick((t) => t + 1)
    }, 1700)
    return () => clearInterval(id)
  }, [inView, autoCycling, rounds.length])

  // hovering or tapping a round takes over from the auto-cycle for good
  function focusRound(i) {
    setAutoCycling(false)
    setActive(i)
    setOpen((prev) => (prev === i ? prev : i))
  }

  function toggleRound(i) {
    setAutoCycling(false)
    setActive(i)
    setOpen((prev) => (prev === i ? null : i))
  }

  return (
    <div ref={rootRef}>
      {/* desktop: horizontal row */}
      <ol className="relative hidden gap-3 sm:flex">
        <span
          aria-hidden="true"
          className={`loop-line-x absolute left-0 right-0 top-[19px] h-px bg-border ${inView ? 'in-view' : ''}`}
        />
        {rounds.map((r, i) => {
          const on = open === i
          const isActive = active === i
          return (
            <li key={r.name} className="relative flex-1">
              <button
                type="button"
                aria-expanded={on}
                onMouseEnter={() => focusRound(i)}
                onClick={() => toggleRound(i)}
                className="flex w-full flex-col items-center text-center"
              >
                <span
                  key={isActive ? `pulse-${i}-${pulseTick}` : `idle-${i}`}
                  className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-pill border text-body font-semibold ${
                    on || isActive ? 'border-accent bg-accent text-surface' : 'border-border bg-surface text-text'
                  } ${isActive ? 'loop-pulse' : ''}`}
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

      {/* mobile: stacked, line down the left edge, tap (not hover) to expand */}
      <ol className="relative space-y-3 pl-8 sm:hidden">
        <span
          aria-hidden="true"
          className={`loop-line-y absolute left-[19px] top-2 bottom-2 w-px bg-border ${inView ? 'in-view' : ''}`}
        />
        {rounds.map((r, i) => {
          const on = open === i
          const isActive = active === i
          return (
            <li key={r.name} className="relative">
              <span
                aria-hidden="true"
                key={isActive ? `pulse-m-${i}-${pulseTick}` : `idle-m-${i}`}
                className={`absolute -left-8 top-0 z-10 grid size-10 place-items-center rounded-pill border text-body font-semibold ${
                  on || isActive ? 'border-accent bg-accent text-surface' : 'border-border bg-surface text-text'
                } ${isActive ? 'loop-pulse' : ''}`}
              >
                {i + 1}
              </span>
              <button
                type="button"
                aria-expanded={on}
                onClick={() => toggleRound(i)}
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
