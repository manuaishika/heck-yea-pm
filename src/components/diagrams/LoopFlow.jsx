import { useRef, useState } from 'react'

/**
 * An interview loop as a horizontal stepper. Numbered pills across the top show
 * every round; below, one round's detail at a time. Swipe the card or tap a
 * pill / arrow to move. No accordion clicking.
 *
 * @param {{ rounds: { name: string, detail: string }[] }} props
 */
export default function LoopFlow({ rounds }) {
  const [i, setI] = useState(0)
  const touch = useRef(null)
  const go = (n) => setI(Math.min(Math.max(n, 0), rounds.length - 1))
  const r = rounds[i]

  return (
    <div className="mt-3">
      {/* pills */}
      <ol className="flex items-center gap-2 overflow-x-auto pb-1">
        {rounds.map((round, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <button
              type="button"
              aria-current={idx === i ? 'step' : undefined}
              aria-label={`Round ${idx + 1}: ${round.name}`}
              onClick={() => go(idx)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-button border text-body font-semibold ${
                idx === i
                  ? 'border-border bg-accent text-surface'
                  : idx < i
                    ? 'border-border bg-surface text-text'
                    : 'border-border text-text-muted'
              }`}
            >
              {idx + 1}
            </button>
            {idx < rounds.length - 1 && (
              <span
                className={`h-1 w-4 ${idx < i ? 'bg-text' : 'bg-border'}`}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>

      {/* card */}
      <div
        className="card mt-3 min-h-22 p-3"
        onTouchStart={(e) => {
          touch.current = e.changedTouches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touch.current == null) return
          const dx = e.changedTouches[0].clientX - touch.current
          if (dx < -40) go(i + 1)
          else if (dx > 40) go(i - 1)
          touch.current = null
        }}
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-body font-semibold text-text">{r.name}</p>
          <p className="label shrink-0">
            {i + 1} / {rounds.length}
          </p>
        </div>
        {r.detail && (
          <p className="mt-1 text-body leading-relaxed text-text-muted">{r.detail}</p>
        )}
      </div>

      {/* arrows */}
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="btn btn-sm disabled:opacity-30"
        >
          ‹ prev
        </button>
        <span className="label">swipe to move</span>
        <button
          type="button"
          onClick={() => go(i + 1)}
          disabled={i === rounds.length - 1}
          className="btn btn-sm disabled:opacity-30"
        >
          next ›
        </button>
      </div>
    </div>
  )
}
